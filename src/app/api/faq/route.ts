import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { serviceDesc, audience, count } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'the business'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Generate ${count || 10} frequently asked questions (and answers) for:

Business/Service: ${serviceDesc}
${businessName !== 'the business' ? `Business name: ${businessName}` : ''}
Target audience: ${audience || 'potential customers'}

Think like a customer who has never heard of this service before. What would they ask?
Cover: pricing, process, timeline, what's included, guarantees, how to get started, who it's for, common concerns.

Format each as:
**Q: [question]**
A: [clear, confident answer in 1-3 sentences]

Write all ${count || 10} Q&As now.` }],
    temperature: 0.5,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
