import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import nodemailer from 'nodemailer'

// Protected by a secret key — call with ?secret=YOUR_CRON_SECRET
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find ALL due emails across all users
  const due = await db.scheduledEmail.findMany({
    where: { status: 'pending', scheduledAt: { lte: now } },
    include: { user: { include: { settings: true } } },
  })

  if (due.length === 0) return NextResponse.json({ sent: 0 })

  let sent = 0
  let failed = 0

  for (const email of due) {
    const settings = email.user.settings
    const fromEmail = settings?.emailFrom || process.env.EMAIL_FROM || ''
    const fromPass  = settings?.emailPassword || process.env.EMAIL_PASSWORD || ''
    const fromName  = settings?.businessName || ''

    if (!fromEmail || !fromPass) {
      await db.scheduledEmail.update({ where: { id: email.id }, data: { status: 'failed' } })
      failed++
      continue
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: fromEmail, pass: fromPass },
      })
      await transporter.sendMail({
        from: fromName ? `"${fromName}" <${fromEmail}>` : `<${fromEmail}>`,
        to: email.to,
        subject: email.subject,
        text: email.body,
      })
      await db.scheduledEmail.update({ where: { id: email.id }, data: { status: 'sent' } })
      sent++
    } catch {
      await db.scheduledEmail.update({ where: { id: email.id }, data: { status: 'failed' } })
      failed++
    }
  }

  return NextResponse.json({ sent, failed })
}
