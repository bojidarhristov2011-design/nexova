import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TEMPLATES: Record<string, string> = {
  proposal: 'Write a professional business proposal email',
  followup: 'Write a polite follow-up email to a client who has not responded',
  invoice_reminder: 'Write a friendly but firm payment reminder email for an overdue invoice',
  thank_you: 'Write a warm thank you email to a client after completing a project',
  cold_outreach: 'Write a compelling cold outreach email to a potential business client',
  complaint_response: 'Write a professional and empathetic response to a customer complaint',
  meeting_request: 'Write a concise email requesting a business meeting',
  project_update: 'Write a clear project status update email to a client',
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, context } = await request.json()
  const baseInstruction = TEMPLATES[type] || 'Write a professional business email'

  const prompt = `${baseInstruction}.

Context provided by the user: ${context || 'None provided'}

Requirements:
- Professional but warm tone
- Concise and clear
- Ready to send (include Subject line at the top)
- Do NOT use placeholders like [Name] — write it generically if no name given
- Format: first line is "Subject: ..." then a blank line then the email body`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
    const text = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ content: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
