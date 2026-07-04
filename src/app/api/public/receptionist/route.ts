import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'
import nodemailer from 'nodemailer'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { userId, message, visitorName, visitorEmail, visitorPhone, history } = await req.json()
  if (!userId || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId } })
  if (!settings?.receptionistEnabled) {
    return NextResponse.json({ error: 'Receptionist not active' }, { status: 403 })
  }

  const systemPrompt = `You are ${settings.receptionistName}, the AI receptionist for ${settings.businessName || 'this business'}.

About the business: ${settings.businessDesc || 'A local business'}
Services offered: ${settings.receptionistServices || 'Various services'}
Opening hours: ${settings.receptionistHours || 'Contact us for hours'}
${settings.receptionistBookingLink ? `Booking link: ${settings.receptionistBookingLink}` : ''}

Your job:
- Greet visitors warmly and answer questions about the business
- If asked about booking/appointments, share the booking link or ask them to provide their name, email, and phone so staff can contact them
- Keep replies short (2-3 sentences max)
- Be friendly and professional
- If you don't know something, say you'll pass the message to the team

When a visitor shares their contact details (name + email or phone), end your reply with exactly this on a new line:
CAPTURE:name=<their name>,email=<their email>,phone=<their phone or blank>`

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: message },
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.6,
  })

  const reply = completion.choices[0].message.content || ''

  // Check if we should capture a lead
  const captureMatch = reply.match(/CAPTURE:name=([^,]*),email=([^,]*),phone=([^\n]*)/)
  let captured = false
  if (captureMatch) {
    const name  = captureMatch[1].trim() || visitorName || 'Visitor'
    const email = captureMatch[2].trim() || visitorEmail || ''
    const phone = captureMatch[3].trim() || visitorPhone || ''

    if (name || email) {
      await db.contact.create({
        data: { userId, name, email: email || null, phone: phone || null, notes: 'Via AI Receptionist', status: 'lead' },
      })

      // Send auto-reply if email provided
      if (email && settings.emailFrom && settings.emailPassword) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: settings.emailFrom, pass: settings.emailPassword },
          })
          await transporter.sendMail({
            from: `"${settings.businessName}" <${settings.emailFrom}>`,
            to: email,
            subject: `Thanks for contacting ${settings.businessName}!`,
            text: `Hi ${name},\n\nThanks for reaching out! We've received your message and will get back to you shortly.\n\nTalk soon,\n${settings.businessName}`,
          })
        } catch { /* email send failed, ignore */ }
      }
      captured = true
    }
  }

  const cleanReply = reply.replace(/CAPTURE:[^\n]*/g, '').trim()
  return NextResponse.json({ reply: cleanReply, captured })
}
