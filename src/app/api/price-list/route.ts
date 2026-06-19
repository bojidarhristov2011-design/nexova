import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessName, businessType, services, currency, tagline, includePackages } = await request.json()

  const prompt = `You are a professional business consultant. Create a clean, professional price list / service menu.

Business name: ${businessName}
Business type: ${businessType}
Currency: ${currency}
Tagline: ${tagline || ''}
Services provided by the client: ${services}
Include packages/bundles: ${includePackages ? 'Yes — group related services into 2-3 packages with a package price (slight discount vs individual)' : 'No — list individual services only'}

Create a professional price list that includes:
1. A header with business name and tagline
2. Clearly listed services with prices
3. A short 1-line description for each service
4. ${includePackages ? 'Then 2-3 bundled packages with names and savings' : ''}
5. A footer note (e.g. "Prices valid until [end of year]" or "Custom quotes available")

Format it cleanly with clear sections. Use ${currency} for all prices. Make prices realistic for the industry.
Write ONLY the price list content. No extra commentary.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    })
    return NextResponse.json({ content: completion.choices[0].message.content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate price list' }, { status: 500 })
  }
}
