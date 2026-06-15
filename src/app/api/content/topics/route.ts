import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName?.trim()
  const businessDesc = settings?.businessDesc?.trim()

  if (!businessName && !businessDesc) {
    return NextResponse.json({ topics: null }) // signal to use generic topics
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a social media strategist. Based on this business, generate exactly 8 specific and engaging post topic ideas.

Business name: ${businessName}
Business description: ${businessDesc}

Rules:
- Each topic must be specific to THIS business, not generic
- Topics should be interesting for their target audience
- Mix of: announcements, education, behind-the-scenes, promotions, community, tips
- Keep each topic under 60 characters
- Return ONLY a JSON array of 8 strings, no explanation, no markdown, just the raw JSON array

Example format: ["Topic one", "Topic two", "Topic three", ...]`
      }],
      temperature: 0.8,
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]'
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    const topics: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ topics: topics.slice(0, 8) })
  } catch {
    return NextResponse.json({ topics: null })
  }
}
