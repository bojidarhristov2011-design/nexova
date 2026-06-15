import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TYPE_PROMPTS: Record<string, string> = {
  connection: 'a personalized LinkedIn connection request (max 300 characters, friendly, mention a specific reason for connecting)',
  followup: 'a follow-up message after connecting on LinkedIn (friendly, add value, soft CTA)',
  sales: 'a LinkedIn sales outreach message (problem-focused, not pushy, clear value proposition, end with a question)',
  testimonial: 'a LinkedIn message asking for a testimonial or recommendation (genuine, specific, easy to say yes to)',
  collaboration: 'a LinkedIn collaboration pitch message (mutual benefit focused, specific idea, professional)',
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type, context } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'my business'
  const prompt = TYPE_PROMPTS[type] || TYPE_PROMPTS.connection
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write ${prompt} for someone representing ${businessName}. Additional context: ${context || 'none'}. Write only the message, no labels or explanation.` }],
    temperature: 0.75,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
