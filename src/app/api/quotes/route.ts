import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { clientName, serviceDesc, price, currency, validDays } = await req.json()
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const businessName = settings?.businessName || 'Our Business'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a professional price quote/estimate from "${businessName}" to "${clientName}".

Service: ${serviceDesc}
Total Price: ${currency}${price}
Quote valid for: ${validDays} days

Include:
- A short professional intro paragraph
- Itemised breakdown of what's included (3-6 line items with individual prices that add up to the total)
- What's NOT included (scope boundaries)
- Payment terms (50% upfront, 50% on completion)
- Quote validity
- A professional closing with next steps

Format clearly with headers. Professional but warm tone.` }],
    temperature: 0.4,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
