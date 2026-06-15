import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { contractType, clientName, projectDesc, price, currency, deliveryDays } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'Service Provider'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a professional ${contractType} contract between "${businessName}" (Service Provider) and "${clientName}" (Client).

Project/Service: ${projectDesc}
Price: ${price} ${currency}
Delivery: ${deliveryDays} days

Include these sections:
1. PARTIES
2. SCOPE OF WORK
3. PAYMENT TERMS (50% upfront, 50% on delivery)
4. TIMELINE
5. REVISIONS (2 rounds included)
6. INTELLECTUAL PROPERTY
7. CONFIDENTIALITY
8. TERMINATION
9. LIMITATION OF LIABILITY
10. SIGNATURES

Write the full contract. Professional legal language but clear. Include [DATE] and [SIGNATURE] placeholders.` }],
    temperature: 0.3,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
