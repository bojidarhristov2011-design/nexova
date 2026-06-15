import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { review, stars, platform } = await request.json()
  if (!review) return NextResponse.json({ error: 'Review text is required' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName?.trim() || 'our business'

  const starsNum = parseInt(stars) || 5
  const sentiment = starsNum >= 4 ? 'positive' : starsNum === 3 ? 'neutral' : 'negative/critical'

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Write a professional response to this ${starsNum}-star ${sentiment} customer review on ${platform || 'Google'}.

Business: ${businessName}
Review: "${review}"
Rating: ${starsNum}/5 stars

Response guidelines:
- Thank the customer by name if mentioned, otherwise say "Thank you for your review"
- For positive reviews: express genuine gratitude, mention what you're proud of, invite them back
- For negative reviews: apologize sincerely, acknowledge the issue, offer to make it right privately (provide email or phone)
- For neutral reviews: thank them and highlight what you're working on improving
- Keep it 3-5 sentences
- Sound human and authentic, NOT corporate
- Do NOT use "We apologize for any inconvenience" (it's cliché)
- End with a personal touch

Write only the response text, nothing else.`
      }],
      temperature: 0.7,
    })

    return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
