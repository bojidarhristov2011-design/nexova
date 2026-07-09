import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, style, duration } = await req.json()

  const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'our business'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `You are a viral TikTok content creator for ${businessName}.

Write a ${duration}-second TikTok video script about: ${topic}
Style: ${style}

Format with these sections:
HOOK (first 3 seconds):
[attention-grabbing opening that stops scrolling]

SCRIPT:
[spoken words for the video, ${duration} seconds worth]

CAPTION:
[short punchy caption with relevant emojis]

HASHTAGS:
[10 relevant hashtags]

Write only the script, no explanations.`,
    }],
    temperature: 0.85,
  })

  const script = completion.choices[0]?.message?.content ?? ''
  return NextResponse.json({ script })
}
