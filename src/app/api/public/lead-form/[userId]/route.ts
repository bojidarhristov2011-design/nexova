import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { autoScheduleNurture, sendInstantAutoReply } from '@/lib/automation'

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const settings = await db.userSettings.findUnique({ where: { userId } })
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    businessName: settings?.businessName || 'this business',
    businessDesc: settings?.businessDesc || '',
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, email, phone, message } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  await db.contact.create({
    data: {
      userId,
      name,
      email: email || null,
      phone: phone || null,
      status: 'lead',
      notes: message ? `From website form: ${message}` : 'Captured from public lead form',
    },
  })

  if (email) {
    const settings = await db.userSettings.findUnique({ where: { userId } })
    if (settings?.autoReplyOnLeadCapture) await sendInstantAutoReply(userId, name, email)
    if (settings?.autoNurtureOnLead) await autoScheduleNurture(userId, name, email)
  }

  return NextResponse.json({ success: true })
}
