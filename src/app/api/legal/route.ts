import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { docType, businessName, businessType, website, country } = await req.json()
  const isPrivacy = docType === 'privacy'
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: isPrivacy
      ? `Write a comprehensive Privacy Policy for:
Business name: ${businessName}
Business type: ${businessType}
Website: ${website || '[WEBSITE URL]'}
Country/jurisdiction: ${country || 'European Union'}

Include sections: Introduction, Data We Collect, How We Use Your Data, Cookies, Third-Party Services, Data Retention, Your Rights (GDPR if EU), Data Security, Contact Information, Changes to This Policy.

Write the full policy. Professional legal language. Add [DATE] placeholder for effective date.`
      : `Write a comprehensive Terms and Conditions document for:
Business name: ${businessName}
Business type: ${businessType}
Website: ${website || '[WEBSITE URL]'}
Country/jurisdiction: ${country || 'European Union'}

Include sections: Acceptance of Terms, Services, Payment Terms, Cancellations & Refunds, Intellectual Property, User Responsibilities, Limitation of Liability, Governing Law, Changes to Terms, Contact Information.

Write the full Terms & Conditions. Professional legal language. Add [DATE] placeholder for effective date.`
    }],
    temperature: 0.2,
  })
  return NextResponse.json({ content: completion.choices[0]?.message?.content?.trim() })
}
