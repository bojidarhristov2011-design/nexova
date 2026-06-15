import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientName, projectTitle, projectDetails, price, currency } = await request.json()
  if (!clientName || !projectDetails) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName?.trim() || 'Our Company'
  const businessDesc = settings?.businessDesc?.trim() || ''

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Write a professional business proposal for the following:

Business (sender): ${businessName}
${businessDesc ? `About us: ${businessDesc}` : ''}
Client name: ${clientName}
Project title: ${projectTitle || 'Business Project'}
Project details: ${projectDetails}
Price: ${price ? `${currency || '€'}${price}` : 'To be discussed'}

Write a complete, professional proposal with these sections:
1. Introduction / Executive Summary
2. Understanding Your Needs
3. Our Proposed Solution
4. What's Included
5. Investment (price and payment terms)
6. Why Choose Us
7. Next Steps

Tone: professional but warm. Keep it concise but complete (600-900 words total).
Format with clear headings. Do NOT use markdown symbols like ** or ##. Use plain text headings.`
      }],
      temperature: 0.7,
    })

    return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
