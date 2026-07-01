import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { searchBusinesses } from '@/lib/leadSearch'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const PERSONAS: Record<string, { label: string; prompt: string; tools: string[] }> = {
  general: {
    label: 'General',
    prompt: 'You have access to all business tools: CRM, invoices, scheduled emails, and scheduled social posts.',
    tools: ['add_contact', 'list_contacts', 'create_invoice', 'list_invoices', 'schedule_email', 'schedule_social_post'],
  },
  copywriter: {
    label: 'Copywriter',
    prompt: 'You are a Copywriter specialist. Your job is to write excellent marketing copy — social captions, ad copy, content ideas — and schedule it for posting. Always write the actual content yourself, well-crafted and specific to the business, then schedule it. Do not ask the user to write it.',
    tools: ['schedule_social_post', 'list_contacts'],
  },
  researcher: {
    label: 'Lead Researcher',
    prompt: 'You are a Lead Researcher specialist. Your job is to find real businesses matching what the user is targeting (by type and location) and add the good ones to the CRM as leads. Always search first, show results, then add the ones that fit.',
    tools: ['search_businesses', 'add_contact', 'list_contacts'],
  },
  outreach: {
    label: 'Outreach Specialist',
    prompt: 'You are an Outreach Specialist. Your job is to draft and schedule outreach and follow-up emails to leads and customers. Write warm, specific, non-generic emails tailored to the business and the recipient, then schedule them.',
    tools: ['schedule_email', 'add_contact', 'list_contacts'],
  },
}

const ALL_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'add_contact',
      description: 'Add a new contact (lead or customer) to the CRM',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          company: { type: 'string' },
          status: { type: 'string', enum: ['lead', 'customer', 'lost'] },
          notes: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_contacts',
      description: 'List all contacts in the CRM, optionally filtered by status',
      parameters: {
        type: 'object',
        properties: { status: { type: 'string', enum: ['lead', 'customer', 'lost'] } },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_invoice',
      description: 'Create an invoice for a client',
      parameters: {
        type: 'object',
        properties: {
          clientName: { type: 'string' },
          clientEmail: { type: 'string' },
          description: { type: 'string', description: 'What the invoice is for' },
          quantity: { type: 'number' },
          unitPrice: { type: 'number' },
          currency: { type: 'string', enum: ['USD', 'EUR', 'GBP'] },
          dueDate: { type: 'string', description: 'YYYY-MM-DD' },
        },
        required: ['clientName', 'clientEmail', 'description', 'unitPrice'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_invoices',
      description: 'List recent invoices and their status',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_email',
      description: 'Schedule an email to be sent to a client at a future date',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
          scheduledAt: { type: 'string', description: 'ISO date, e.g. 2026-07-01T09:00:00' },
          label: { type: 'string' },
        },
        required: ['to', 'subject', 'body', 'scheduledAt'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_social_post',
      description: 'Schedule a social media post for a future date',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['telegram', 'instagram', 'linkedin', 'facebook'] },
          content: { type: 'string' },
          scheduledAt: { type: 'string', description: 'ISO date, e.g. 2026-07-01T09:00:00' },
        },
        required: ['platform', 'content', 'scheduledAt'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_businesses',
      description: 'Search for real businesses by type and location (e.g. "hair salons" near "Burgas, Bulgaria")',
      parameters: {
        type: 'object',
        properties: {
          businessType: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['businessType', 'location'],
      },
    },
  },
]

async function runTool(name: string, args: Record<string, unknown>, userId: string) {
  switch (name) {
    case 'add_contact': {
      const c = await db.contact.create({
        data: {
          userId,
          name: String(args.name),
          email: (args.email as string) || null,
          phone: (args.phone as string) || null,
          company: (args.company as string) || null,
          status: (args.status as string) || 'lead',
          notes: (args.notes as string) || null,
        },
      })
      return { success: true, contact: c }
    }
    case 'list_contacts': {
      const contacts = await db.contact.findMany({
        where: { userId, ...(args.status ? { status: args.status as string } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
      return { contacts }
    }
    case 'create_invoice': {
      const quantity = (args.quantity as number) || 1
      const unitPrice = args.unitPrice as number
      const subtotal = quantity * unitPrice
      const count = await db.invoice.count({ where: { userId } })
      const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`
      const inv = await db.invoice.create({
        data: {
          userId,
          invoiceNumber,
          clientName: String(args.clientName),
          clientEmail: String(args.clientEmail),
          items: JSON.stringify([{ description: args.description, quantity, unitPrice }]),
          subtotal,
          tax: 0,
          total: subtotal,
          currency: (args.currency as string) || 'EUR',
          dueDate: (args.dueDate as string) || null,
        },
      })
      return { success: true, invoice: inv }
    }
    case 'list_invoices': {
      const invoices = await db.invoice.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 })
      return { invoices }
    }
    case 'schedule_email': {
      const e = await db.scheduledEmail.create({
        data: {
          userId,
          to: String(args.to),
          subject: String(args.subject),
          body: String(args.body),
          scheduledAt: new Date(args.scheduledAt as string),
          label: (args.label as string) || null,
        },
      })
      return { success: true, scheduledEmail: e }
    }
    case 'schedule_social_post': {
      const p = await db.scheduledPost.create({
        data: {
          userId,
          platform: String(args.platform),
          content: String(args.content),
          scheduledAt: new Date(args.scheduledAt as string),
        },
      })
      return { success: true, scheduledPost: p }
    }
    case 'search_businesses': {
      try {
        const results = await searchBusinesses(String(args.businessType), String(args.location))
        return { results: results.slice(0, 10) }
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'Search failed' }
      }
    }
    default:
      return { error: 'Unknown tool' }
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { messages, persona: personaKey } = await request.json()
  if (!messages?.length) return NextResponse.json({ error: 'No messages' }, { status: 400 })

  const persona = PERSONAS[personaKey] || PERSONAS.general
  const tools = ALL_TOOLS.filter(t => persona.tools.includes(t.function.name))

  const systemPrompt = `You are the Nexova Business Operator. ${persona.prompt} When the user asks you to do something, actually call the right tool instead of just describing it. Confirm what you did afterwards in a short, clear summary. Today's date is ${new Date().toISOString().split('T')[0]}.`

  const chatMessages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; tool_calls?: unknown[] }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: m.content })),
  ]

  const actionsLog: Array<{ tool: string; result: unknown }> = []

  try {
    for (let i = 0; i < 5; i++) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: chatMessages as any,
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
      })

      const msg = completion.choices[0].message

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return NextResponse.json({ content: msg.content, actions: actionsLog })
      }

      chatMessages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls })

      for (const call of msg.tool_calls) {
        const args = JSON.parse(call.function.arguments || '{}')
        const result = await runTool(call.function.name, args, userId)
        actionsLog.push({ tool: call.function.name, result })
        chatMessages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) })
      }
    }
    return NextResponse.json({ content: 'Done.', actions: actionsLog })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
