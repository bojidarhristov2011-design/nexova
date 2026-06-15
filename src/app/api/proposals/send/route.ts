import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { to, subject, body } = await req.json()
  if (!to || !body) return NextResponse.json({ error: 'Missing recipient or proposal body' }, { status: 400 })
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD } })
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject: subject || 'Business Proposal', text: body })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send' }, { status: 500 })
  }
}
