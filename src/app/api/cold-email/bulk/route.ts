import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'
import nodemailer from 'nodemailer'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contacts, offer, problem, target } = await req.json()
  // contacts: [{ name: string, email: string }]
  if (!contacts?.length) return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const senderName = settings?.businessName || session.user.name || 'Bojidar'
  const emailFrom = process.env.EMAIL_FROM
  const emailPassword = process.env.EMAIL_PASSWORD

  if (!emailFrom || !emailPassword) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }

  // Generate one template with {name} placeholder
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Write a short, effective cold email for outreach.

Sender: ${senderName}
Target: ${target || 'local businesses'}
Problem we solve: ${problem || 'losing clients who don\'t come back'}
Our offer: ${offer || 'AI automation system that brings clients back automatically'}

Rules:
- Use {name} as the recipient name placeholder
- Maximum 5 sentences
- Lead with their problem, not our product
- One clear CTA at the end (reply if interested)
- No fluff, no "I hope this email finds you well"
- Sound like a real person, not a salesperson

Reply with ONLY this format:
Subject: [subject line]

[email body]`,
    }],
    temperature: 0.7,
  })

  const template = completion.choices[0]?.message?.content?.trim() || ''

  // Parse subject and body
  const lines = template.split('\n')
  const subjectLine = lines.find(l => l.startsWith('Subject:')) || 'Subject: Quick question'
  const subject = subjectLine.replace('Subject:', '').trim()
  const body = lines.filter(l => !l.startsWith('Subject:')).join('\n').trim()

  // Send to each contact
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailFrom, pass: emailPassword },
  })

  const results: { name: string; email: string; success: boolean }[] = []

  for (const contact of contacts) {
    const personalizedBody = body.replace(/\{name\}/g, contact.name)
    try {
      await transporter.sendMail({
        from: emailFrom,
        to: contact.email,
        subject,
        text: personalizedBody,
      })
      results.push({ name: contact.name, email: contact.email, success: true })
    } catch {
      results.push({ name: contact.name, email: contact.email, success: false })
    }
  }

  return NextResponse.json({ results, subject, template: body })
}
