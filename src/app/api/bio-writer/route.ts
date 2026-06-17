import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { businessName, businessType, services, audience, tone, founded } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const name = businessName || settings?.businessName || 'Our Business'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write professional About Us / business bio content for:

Business name: ${name}
Business type: ${businessType}
Services offered: ${services}
Target audience: ${audience}
Tone: ${tone || 'professional and approachable'}
${founded ? `Founded: ${founded}` : ''}

Generate 3 versions:

### SHORT BIO (social media — 1-2 sentences, max 160 characters)
(Instagram/LinkedIn bio style)

### MEDIUM BIO (website header — 2-3 sentences)
(For the hero section or team page)

### FULL ABOUT US (website About page — 3-4 paragraphs)
(Full story, mission, what you do, who you serve, why choose us)

Each version should feel natural and authentic, not generic.` }],
    temperature: 0.6,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
