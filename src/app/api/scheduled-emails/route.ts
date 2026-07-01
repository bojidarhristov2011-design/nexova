import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentBusinessId } from '@/lib/currentBusiness'
import nodemailer from 'nodemailer'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const emails = await db.scheduledEmail.findMany({
    where: { userId: session.user.id, ...(businessId ? { businessId } : {}) },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json(emails)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const { to, subject, body, scheduledAt, label } = await req.json()
  if (!to || !body || !scheduledAt) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const email = await db.scheduledEmail.create({
    data: { userId: session.user.id, businessId, to, subject: subject || '', body, scheduledAt: new Date(scheduledAt), label },
  })
  return NextResponse.json(email)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await db.scheduledEmail.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}

// Called to send all due emails
export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const now = new Date()
  const due = await db.scheduledEmail.findMany({
    where: { userId: session.user.id, ...(businessId ? { businessId } : {}), status: 'pending', scheduledAt: { lte: now } },
  })

  if (due.length === 0) return NextResponse.json({ sent: 0 })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  })

  let sent = 0
  for (const email of due) {
    try {
      await transporter.sendMail({
        from: `<${process.env.EMAIL_FROM}>`,
        to: email.to,
        subject: email.subject,
        text: email.body,
      })
      await db.scheduledEmail.update({ where: { id: email.id }, data: { status: 'sent' } })
      sent++
    } catch {
      await db.scheduledEmail.update({ where: { id: email.id }, data: { status: 'failed' } })
    }
  }

  return NextResponse.json({ sent })
}
