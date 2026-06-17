import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { platform, topic, tone, cta } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || ''
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write 3 ${platform} captions for a post about: "${topic}"
${businessName ? `Business: ${businessName}` : ''}
Tone: ${tone || 'engaging and authentic'}
Call to action: ${cta || 'follow for more'}

For each caption:
- Hook (first line that stops the scroll)
- Body (2-4 lines)
- CTA
- 10-15 relevant hashtags

Separate each caption with ---

${platform === 'TikTok' ? 'Keep captions short and punchy. Use line breaks. TikTok style.' : ''}
${platform === 'Instagram' ? 'Can be longer. Conversational. Use emojis naturally.' : ''}
${platform === 'LinkedIn' ? 'Professional tone. No excessive emojis. Story-based hook.' : ''}

Write all 3 captions now.` }],
    temperature: 0.8,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
