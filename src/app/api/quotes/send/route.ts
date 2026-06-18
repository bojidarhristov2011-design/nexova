import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body } = await req.json()
  if (!to || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  })

  await transporter.sendMail({
    from: `"${session.user.name || session.user.email}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: subject || 'Your Quote',
    text: body,
  })

  return NextResponse.json({ success: true })
}
