import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_contacts',
      description: 'Get CRM contacts. Filter by status, whether they have email, or search by name.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['lead', 'customer', 'lost'], description: 'Filter by contact status' },
          has_email: { type: 'boolean', description: 'Only return contacts with email addresses' },
          name_search: { type: 'string', description: 'Search by name' },
          limit: { type: 'number', description: 'Max results, default 100' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_email_content',
      description: 'Write a professional email subject and body for a given purpose. Returns {subject, body}.',
      parameters: {
        type: 'object',
        required: ['purpose'],
        properties: {
          purpose: { type: 'string', description: 'Email purpose e.g. "re-engagement", "appointment reminder", "promotion", "follow-up"' },
          tone: { type: 'string', enum: ['friendly', 'professional', 'urgent', 'warm'], description: 'Tone of the email' },
          include_offer: { type: 'string', description: 'Optional special offer or discount to mention' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'schedule_emails_to_contacts',
      description: 'Schedule an email to multiple contacts. Use contact IDs from get_contacts.',
      parameters: {
        type: 'object',
        required: ['contact_ids', 'subject', 'body', 'send_at'],
        properties: {
          contact_ids: { type: 'array', items: { type: 'string' }, description: 'Contact IDs to email' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Email body. Use {name} to personalise.' },
          send_at: { type: 'string', description: 'ISO datetime string, or "now" to send immediately' },
          label: { type: 'string', description: 'Campaign label e.g. "Re-engagement Campaign"' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_platform_stats',
      description: 'Get stats: total contacts, leads, customers, pending scheduled emails',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_loyalty_points',
      description: 'Add or remove loyalty points from contacts',
      parameters: {
        type: 'object',
        required: ['contact_ids', 'points'],
        properties: {
          contact_ids: { type: 'array', items: { type: 'string' } },
          points: { type: 'number', description: 'Points to add (positive) or remove (negative)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_crm_contact',
      description: 'Add a new contact to the CRM',
      parameters: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          company: { type: 'string' },
          status: { type: 'string', enum: ['lead', 'customer'] },
          notes: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_waitlist',
      description: 'Add contacts to the waitlist for a service',
      parameters: {
        type: 'object',
        required: ['contact_ids', 'service'],
        properties: {
          contact_ids: { type: 'array', items: { type: 'string' } },
          service: { type: 'string' },
        },
      },
    },
  },
]

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  biz: { businessName: string; businessDesc: string }
): Promise<{ result: unknown; action?: string }> {

  if (name === 'get_contacts') {
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        ...(args.status ? { status: args.status as string } : {}),
        ...(args.has_email ? { email: { not: null } } : {}),
        ...(args.name_search ? { name: { contains: args.name_search as string, mode: 'insensitive' } } : {}),
      },
      take: (args.limit as number) || 100,
      orderBy: { createdAt: 'desc' },
    })
    return {
      result: contacts.map(c => ({
        id: c.id, name: c.name, email: c.email, phone: c.phone,
        status: c.status, loyaltyPoints: c.loyaltyPoints,
      })),
    }
  }


  if (name === 'generate_email_content') {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an email writer for ${biz.businessName}.
${biz.businessDesc ? `Business: ${biz.businessDesc}` : ''}

Write a ${args.tone || 'friendly'} email with purpose: ${args.purpose}
${args.include_offer ? `Include offer: ${args.include_offer}` : ''}

Use {name} as the client name placeholder.

Reply with ONLY valid JSON, no markdown:
{"subject": "...", "body": "Dear {name},\\n\\n...\\n\\nBest regards,\\n${biz.businessName}"}`,
      }],
      temperature: 0.7,
    })
    const raw = (completion.choices[0]?.message?.content || '').replace(/```json|```/g, '').trim()
    try {
      return { result: JSON.parse(raw) }
    } catch {
      return { result: { subject: `Message from ${biz.businessName}`, body: raw } }
    }
  }

  if (name === 'schedule_emails_to_contacts') {
    const contactIds = args.contact_ids as string[]
    const sendAt = args.send_at === 'now' ? new Date() : new Date(args.send_at as string)
    const contacts = await prisma.contact.findMany({
      where: { userId, id: { in: contactIds }, email: { not: null } },
    })
    await prisma.scheduledEmail.createMany({
      data: contacts.map(c => ({
        userId,
        to: c.email!,
        subject: args.subject as string,
        body: (args.body as string).replace(/\{name\}/g, c.name),
        scheduledAt: sendAt,
        label: (args.label as string) || 'AI Operator',
      })),
    })
    return {
      result: { scheduled: contacts.length, names: contacts.map(c => c.name) },
      action: `Scheduled "${args.subject}" to ${contacts.length} client${contacts.length !== 1 ? 's' : ''} for ${sendAt.toLocaleString('en-GB')}`,
    }
  }

  if (name === 'get_platform_stats') {
    const [total, leads, customers, pending] = await Promise.all([
      prisma.contact.count({ where: { userId } }),
      prisma.contact.count({ where: { userId, status: 'lead' } }),
      prisma.contact.count({ where: { userId, status: 'customer' } }),
      prisma.scheduledEmail.count({ where: { userId, status: 'pending' } }),
    ])
    return { result: { totalContacts: total, leads, customers, pendingEmails: pending } }
  }

  if (name === 'update_loyalty_points') {
    const contactIds = args.contact_ids as string[]
    const points = args.points as number
    await Promise.all(contactIds.map(id =>
      prisma.contact.update({ where: { id }, data: { loyaltyPoints: { increment: points } } })
    ))
    return {
      result: { updated: contactIds.length, pointsAdded: points },
      action: `Added ${points} loyalty points to ${contactIds.length} client${contactIds.length !== 1 ? 's' : ''}`,
    }
  }

  if (name === 'create_crm_contact') {
    const contact = await prisma.contact.create({
      data: {
        userId,
        name: args.name as string,
        email: (args.email as string) || null,
        phone: (args.phone as string) || null,
        company: (args.company as string) || null,
        status: (args.status as string) || 'lead',
        notes: (args.notes as string) || null,
      },
    })
    return {
      result: { id: contact.id, name: contact.name },
      action: `Created new CRM contact: ${contact.name}`,
    }
  }

  if (name === 'add_to_waitlist') {
    const contactIds = args.contact_ids as string[]
    const contacts = await prisma.contact.findMany({ where: { userId, id: { in: contactIds } } })
    await prisma.waitlistEntry.createMany({
      data: contacts.map(c => ({
        userId,
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        service: args.service as string,
      })),
    })
    return {
      result: { added: contacts.length },
      action: `Added ${contacts.length} client${contacts.length !== 1 ? 's' : ''} to waitlist for "${args.service}"`,
    }
  }

  return { result: 'Unknown tool' }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()
  const userId = session.user.id

  const settings = await prisma.userSettings.findUnique({ where: { userId } })
  const biz = {
    businessName: settings?.businessName || 'your business',
    businessDesc: settings?.businessDesc || '',
  }

  const systemPrompt = `You are the Nexova AI Operator for ${biz.businessName}.
${biz.businessDesc ? `Business context: ${biz.businessDesc}` : ''}

## Your two-step flow

When the user describes a PROBLEM (something they're struggling with, a challenge, a goal):
1. Diagnose it clearly — explain why it's happening and what the impact is
2. Describe exactly what system you would build inside Nexova to solve it (which contacts you'd target, what emails you'd send, what automation you'd set up)
3. End with: "Want me to set this up for you now?"

Only use your tools and execute actions after the user confirms (they say yes, do it, go ahead, etc.).

When the user CONFIRMS they want it built:
- Use tools to execute the full solution end-to-end
- Chain tools together: get contacts → generate email → schedule it
- Confirm briefly what was done

When the user asks a direct QUESTION (not a problem):
- Answer it directly without asking for confirmation

## Tools available
- get_contacts: find and filter contacts by status, email, name
- generate_email_content: write a professional email
- schedule_emails_to_contacts: schedule emails to specific contacts
- get_platform_stats: total contacts, leads, customers, pending emails
- update_loyalty_points: add/remove points from contacts
- create_crm_contact: add a new contact
- add_to_waitlist: add contacts to a service waitlist

Today: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`

  type GroqMessage = Groq.Chat.ChatCompletionMessageParam
  let currentMessages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const actions: string[] = []

  for (let i = 0; i < 6; i++) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: currentMessages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    })

    const msg = response.choices[0]?.message
    if (!msg) break

    currentMessages.push(msg as GroqMessage)

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return NextResponse.json({ reply: msg.content, actions })
    }

    const toolResults = await Promise.all(
      msg.tool_calls.map(async tc => {
        let args: Record<string, unknown> = {}
        try { args = JSON.parse(tc.function.arguments || '{}') } catch { /* empty */ }
        const { result, action } = await executeTool(tc.function.name, args, userId, biz)
        if (action) actions.push(action)
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        }
      })
    )

    currentMessages.push(...toolResults)
  }

  return NextResponse.json({ reply: 'Done. All actions completed.', actions })
}
