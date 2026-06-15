import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const RF_CONTEXT = `
Robot Factory (robotfactory.io) is a revolutionary project building real humanoid robots powered by community investment.
RF Token contract address on Solana: CJ1fWU1WMoJiGoUdUCuu38nJ6JPpSPSwp3M5YvvNdray
Traded on Raydium DEX. Buy with Phantom wallet.
Mission: Use RF token funds to build real humanoid robots that assist humans with everyday tasks.
Telegram: t.me/robotfactory_io
`

async function fetchRoboticsNews(): Promise<{ title: string; summary: string; source: string }[]> {
  try {
    const parser = await import('@/lib/rssParser')
    const items = await parser.fetchRSSItems('https://spectrum.ieee.org/feeds/topic/robotics.rss')
    return items.slice(0, 5)
  } catch {
    return [
      { title: 'Humanoid robots entering the workforce', summary: 'Major companies deploying humanoid robots in factories', source: 'Industry News' },
      { title: 'AI advances making robots smarter', summary: 'Latest breakthroughs in robot intelligence and dexterity', source: 'Tech News' },
      { title: 'RF Token community growing on Solana', summary: 'Increasing interest in Robot Factory token', source: 'RF Token' },
    ]
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newsItem, type } = await request.json()

  const userSettings = await db.userSettings.findUnique({ where: { userId: session.user.id } })

  const businessName = userSettings?.businessName?.trim() || 'Robot Factory'
  const businessDesc = userSettings?.businessDesc?.trim() || RF_CONTEXT.trim()
  const tone = userSettings?.contentTone || 'exciting'
  const tiktokHandle = userSettings?.tiktokHandle?.trim() || '@robotfactory_io'

  const toneGuide: Record<string, string> = {
    professional: 'Professional and trustworthy. Clear and concise.',
    casual: 'Friendly and conversational. Like talking to a friend.',
    exciting: 'Exciting and energetic. Use enthusiasm and bold claims.',
    educational: 'Informative and educational. Explain clearly.',
  }
  const toneInstruction = toneGuide[tone] ?? toneGuide.professional

  try {
    if (type === 'telegram') {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are the social media manager for ${businessName}.

About the business:
${businessDesc}

Write a Telegram post about this topic: "${newsItem}"

Tone: ${toneInstruction}

Requirements:
- 3-5 sentences max
- Connect the topic to ${businessName}'s work when relevant
- Use 2-3 relevant emojis
- Do NOT use markdown formatting like ** or ##
- Sound authentic, not like an ad

Write only the post, nothing else.`
        }],
        temperature: 0.8,
      })
      return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
    }

    if (type === 'tiktok') {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are the TikTok manager for ${businessName}.

About the business:
${businessDesc}

Create a TikTok video script about this topic: "${newsItem}"

Tone: ${toneInstruction}

Format exactly like this:
HOOK (first 3 seconds): [attention-grabbing opening line]

SCRIPT:
[15-30 second spoken script]

CAPTION:
[Short punchy caption for the post]

HASHTAGS:
[10-15 relevant hashtags]

CTA:
[Call to action for ${tiktokHandle}]`
        }],
        temperature: 0.8,
      })
      return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
    }

    const news = await fetchRoboticsNews()
    return NextResponse.json({ news })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
