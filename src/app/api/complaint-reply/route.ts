import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { complaintText, complaintType, businessType, tone, yourName } = await request.json()

  const prompt = `You are a professional business communication expert. Write a response to a customer complaint.

Business type: ${businessType || 'small business'}
Your name / business: ${yourName || 'the team'}
Complaint type: ${complaintType}
Tone: ${tone}
Customer complaint: "${complaintText}"

Write a professional, ${tone} reply that:
- Acknowledges the issue without making excuses
- Apologises sincerely (if appropriate for the tone)
- Offers a clear solution or next step
- Ends positively and leaves the door open

Write ONLY the reply message itself. No labels, no meta-commentary.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
    return NextResponse.json({ content: completion.choices[0].message.content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
