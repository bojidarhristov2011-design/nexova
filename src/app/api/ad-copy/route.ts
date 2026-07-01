import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessType, product, audience, goal, platform } = await request.json()

  const prompt = `You are an expert Facebook & Instagram ads copywriter. Write 3 distinct ad copy variations.

Business type: ${businessType}
Product/service being advertised: ${product}
Target audience: ${audience}
Campaign goal: ${goal}
Platform: ${platform}

For each variation, provide:
- A short, punchy headline (under 40 characters)
- Primary text (2-3 sentences, scroll-stopping, benefit-focused)
- A call-to-action button text (e.g. "Book Now", "Learn More", "Shop Now")

Format as:
---VARIATION 1---
Headline: ...
Primary text: ...
CTA: ...
---VARIATION 2---
(etc.)

Write ONLY the ad copy. No extra commentary.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    })
    return NextResponse.json({ content: completion.choices[0].message.content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate ad copy' }, { status: 500 })
  }
}
