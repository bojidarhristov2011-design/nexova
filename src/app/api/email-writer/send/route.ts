import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body } = await req.json()
  if (!to || !body) return NextResponse.json({ error: 'Missing recipient or email body' }, { status: 400 })

  const emailFrom = process.env.EMAIL_FROM
  const emailPassword = process.env.EMAIL_PASSWORD
  if (!emailFrom || !emailPassword) {
    return NextResponse.json({ error: 'Email sending is not configured on this server' }, { status: 500 })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailFrom, pass: emailPassword },
    })

    await transporter.sendMail({
      from: emailFrom,
      to,
      subject: subject || '(No subject)',
      text: body,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
