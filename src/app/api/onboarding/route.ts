import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { clientName, serviceType, startDate, notes } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'Our Team'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Create a detailed client onboarding checklist and welcome plan for a new client.

Business providing service: ${businessName}
Client name: ${clientName}
Service/Project type: ${serviceType}
Start date: ${startDate || 'As soon as possible'}
Additional notes: ${notes || 'None'}

Create:

## Welcome Message
(A warm, professional welcome message to send to the client)

## Onboarding Checklist — Week 1
(numbered checklist of tasks to complete in the first week, split between "YOU need to do" and "CLIENT needs to provide")

## Information We Need From the Client
(bullet list of everything you need from the client to get started: logins, assets, details, approvals)

## What the Client Can Expect
(timeline overview: what happens in week 1, 2, 3-4)

## First Meeting Agenda
(suggested agenda for the kickoff call)

Make it thorough and professional. Use checkboxes ([ ]) for checklist items.` }],
    temperature: 0.4,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
