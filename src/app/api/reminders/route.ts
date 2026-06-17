import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { clientName, service, dateTime, channel, notes } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'us'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write 3 appointment reminder messages for:

Client name: ${clientName}
Service/Appointment: ${service}
Date & Time: ${dateTime}
Channel: ${channel || 'WhatsApp'}
Business: ${businessName}
Extra notes: ${notes || 'none'}

Write 3 messages:

---REMINDER 1--- (24 hours before)
(Friendly reminder sent the day before)

---REMINDER 2--- (2 hours before)
(Short, punchy reminder on the day)

---REMINDER 3--- (No-show / late follow-up)
(Sent if client doesn't show up — polite, asks if they want to reschedule)

Each message should feel natural for ${channel || 'WhatsApp'}, not robotic. Include the date/time, what the appointment is for, and contact info to reschedule if needed.` }],
    temperature: 0.5,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
