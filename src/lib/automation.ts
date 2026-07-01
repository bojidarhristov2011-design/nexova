import { db } from '@/lib/db'
import Groq from 'groq-sdk'
import nodemailer from 'nodemailer'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const DAYS = [0, 3, 7]

export async function autoScheduleNurture(userId: string, contactName: string, contactEmail: string, company?: string | null, businessId?: string | null) {
  const settings = await db.userSettings.findUnique({ where: { userId } })
  const businessName = settings?.businessName || ''
  const businessDesc = settings?.businessDesc || ''

  const prompt = `Write a 3-email nurture sequence to follow up with a lead who has shown interest in a business but hasn't booked/bought yet.

The business doing the outreach: ${businessName || 'a small local business'} — ${businessDesc || 'no description provided, infer something reasonable'}
Lead name: ${contactName}
Company (leave out entirely if this is a regular customer, not a company): ${company || 'N/A'}
Notes about the lead: No specific notes — assume they inquired about the business's normal services and write accordingly

These emails are from "${businessName || 'the business'}" to "${contactName}" — write specifically about what THIS business offers. Do NOT write generic corporate sales language like "streamline processes" unless the business is actually a B2B software/consulting company.

Write 3 emails:
- Email 1 (Day 0): Friendly check-in, restate the value, low-pressure
- Email 2 (Day 3): Address a common objection, add a benefit or proof point
- Email 3 (Day 7): Final nudge with light urgency, easy to say yes or no

Each under 120 words, warm, not pushy. Format as:
---EMAIL 1---
(content)
---EMAIL 2---
(content)
---EMAIL 3---
(content)
Write ONLY the emails.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })
    const raw = completion.choices[0].message.content || ''
    const emails = raw.split(/---EMAIL \d+---/).map(s => s.trim()).filter(Boolean)

    const today = new Date()
    for (let i = 0; i < emails.length && i < 3; i++) {
      const scheduledAt = new Date(today)
      scheduledAt.setDate(scheduledAt.getDate() + DAYS[i])
      scheduledAt.setHours(9, 0, 0, 0)
      await db.scheduledEmail.create({
        data: {
          userId,
          businessId: businessId || null,
          to: contactEmail,
          subject: `Following up, ${contactName}`,
          body: emails[i],
          scheduledAt,
          label: `Auto-nurture ${i + 1} — Day ${DAYS[i]} — ${contactName}`,
        },
      })
    }
    return true
  } catch {
    return false
  }
}

export async function sendInstantAutoReply(userId: string, contactName: string, contactEmail: string) {
  const settings = await db.userSettings.findUnique({ where: { userId } })
  const businessName = settings?.businessName || 'us'

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
    })
    await transporter.sendMail({
      from: `"${businessName}" <${process.env.EMAIL_FROM}>`,
      to: contactEmail,
      subject: `Thanks for reaching out to ${businessName}!`,
      text: `Hi ${contactName},\n\nThanks for getting in touch with ${businessName} — we received your message and will get back to you shortly.\n\nTalk soon,\n${businessName}`,
    })
    return true
  } catch {
    return false
  }
}
