import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, context, tone } = await request.json()
  if (!type) return NextResponse.json({ error: 'Message type is required' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName?.trim() || 'our business'
  const businessDesc = settings?.businessDesc?.trim() || ''

  const toneMap: Record<string, string> = {
    professional: 'professional and clear',
    friendly: 'warm and friendly',
    urgent: 'urgent and action-oriented',
    promotional: 'exciting and promotional',
  }

  const typePrompts: Record<string, string> = {
    followup: 'A follow-up message to a lead or customer who hasn\'t responded in a few days',
    promo: 'A promotional message announcing an offer, discount, or new product/service',
    appointment: 'An appointment reminder message',
    thank_you: 'A thank-you message after a purchase or meeting',
    re_engage: 'A re-engagement message to win back an inactive customer',
    invoice: 'A polite payment reminder for an outstanding invoice',
  }

  const messageType = typePrompts[type] || typePrompts.followup

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Write a WhatsApp Business message for ${businessName}.

${businessDesc ? `About the business: ${businessDesc}` : ''}
Message type: ${messageType}
${context ? `Additional context: ${context}` : ''}
Tone: ${toneMap[tone] || toneMap.friendly}

Requirements:
- Max 3-4 short paragraphs (WhatsApp reads better in short blocks)
- Include appropriate WhatsApp emojis (2-4 max, relevant ones)
- End with a clear call to action or question
- Sound like a real person, not a robot
- Use "Hey [Name]" or "Hi [Name]" if you can use a name placeholder
- Keep it under 200 words

Write only the message text.`
      }],
      temperature: 0.75,
    })

    return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
