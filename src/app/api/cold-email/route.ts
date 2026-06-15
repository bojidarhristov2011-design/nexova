import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { targetBusiness, problem, offer, senderName } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'my business'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a cold email sequence of 3 emails for outreach.

Sender: ${senderName || businessName}
Target: ${targetBusiness}
Problem we solve: ${problem}
Our offer: ${offer}

Write all 3 emails with these rules:
- Email 1 (Day 1): Short intro, lead with their problem, soft CTA (reply if interested)
- Email 2 (Day 3): Follow-up, add a quick win or insight, different angle
- Email 3 (Day 7): Final follow-up, create urgency, easy exit

Format exactly like this:
---EMAIL 1---
Subject: [subject]
[body]

---EMAIL 2---
Subject: [subject]
[body]

---EMAIL 3---
Subject: [subject]
[body]` }],
    temperature: 0.7,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
