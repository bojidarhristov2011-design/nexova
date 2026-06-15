import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, keywords, audience, tone } = await request.json()
  if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName?.trim() || ''

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Write a complete SEO-optimized blog post about: "${topic}"

${keywords ? `Target keywords: ${keywords}` : ''}
${audience ? `Target audience: ${audience}` : ''}
Tone: ${tone || 'professional and informative'}
${businessName ? `Written for: ${businessName}` : ''}

Requirements:
- 800-1200 words
- Engaging title (include main keyword)
- Meta description (150-160 chars) at the top labeled "META:"
- Introduction that hooks the reader
- 3-5 main sections with clear headings
- Include practical tips, examples, or data points
- Strong conclusion with a call to action
- Do NOT use markdown ** or ## — use plain text headings with a colon or line break

Start with: META: [the meta description]
Then the full article.`
      }],
      temperature: 0.75,
    })

    return NextResponse.json({ content: completion.choices[0]?.message?.content ?? '' })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
