import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { transcript, meetingTitle } = await req.json()
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `You are an expert meeting notes assistant. Analyse this meeting transcript and produce structured notes.

Meeting: ${meetingTitle || 'Meeting'}

TRANSCRIPT:
${transcript}

Output in this exact format:

## Meeting Summary
(2-3 sentence overview of what was discussed and decided)

## Key Points
(bullet list of the most important points discussed)

## Decisions Made
(bullet list of decisions that were agreed upon)

## Action Items
(numbered list: each item as "ACTION: [person responsible] — [what they need to do] — [deadline if mentioned]")

## Follow-up Questions
(any open questions or things that need clarification)

Be concise and clear. Focus on what matters.` }],
    temperature: 0.2,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
