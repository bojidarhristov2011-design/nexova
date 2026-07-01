import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contactName, company, notes, senderName } = await request.json()

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || ''
  const businessDesc = settings?.businessDesc || ''

  const prompt = `Write a 3-email nurture sequence to follow up with a lead who has shown interest in a business but hasn't booked/bought yet.

The business doing the outreach: ${businessName || 'a small local business'} — ${businessDesc || 'no description provided, infer something reasonable'}
Lead name: ${contactName}
Company (if relevant — leave out entirely if this is a regular customer, not a company): ${company || 'N/A'}
Notes about the lead / what they were interested in: ${notes || 'No specific notes — assume they inquired about the business\'s normal services and write accordingly'}
Sender name (the business owner): ${senderName || businessName || ''}

These emails are from "${businessName || 'the business'}" to "${contactName}" — write them specifically about what THIS business offers, in a tone that fits the business type (e.g. warm and casual for a local salon/shop, more formal for B2B services). Do NOT write generic corporate sales language like "streamline processes" or "operational efficiency" unless the business is actually a B2B software/consulting company.

Write 3 emails:
- Email 1 (Day 0): Friendly check-in, restate the value, low-pressure
- Email 2 (Day 3): Address a common objection, add a testimonial-style proof point or specific benefit
- Email 3 (Day 7): Final nudge with light urgency, make it easy to say yes or no

Each email should be short (under 120 words), warm, not pushy. Format as:
---EMAIL 1---
(content)
---EMAIL 2---
(content)
---EMAIL 3---
(content)

Write ONLY the emails. No extra commentary.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
    return NextResponse.json({ content: completion.choices[0].message.content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate sequence' }, { status: 500 })
  }
}
