import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoiceId } = await request.json()
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice || invoice.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const daysOverdue = invoice.dueDate ? Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000) : 0

  const prompt = `Write a short, polite but firm payment reminder email for an overdue invoice.

Client name: ${invoice.clientName}
Invoice number: ${invoice.invoiceNumber}
Amount due: ${invoice.total} ${invoice.currency}
Days overdue: ${daysOverdue > 0 ? daysOverdue : 0}

Tone: professional, friendly but clear about needing payment. Keep it under 100 words. Write ONLY the email body, no subject line, no commentary.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    })
    return NextResponse.json({ content: completion.choices[0].message.content, daysOverdue })
  } catch {
    return NextResponse.json({ error: 'Failed to generate reminder' }, { status: 500 })
  }
}
