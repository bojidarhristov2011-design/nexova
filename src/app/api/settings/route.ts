import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(settings ?? {
    businessName: '', businessDesc: '', telegramToken: '',
    telegramChannel: '', tiktokHandle: '', contentTone: 'professional',
    autoNurtureOnLead: false, autoReplyOnLeadCapture: false,
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const settings = await db.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      businessName:    body.businessName    ?? '',
      businessDesc:    body.businessDesc    ?? '',
      telegramToken:   body.telegramToken   ?? '',
      telegramChannel: body.telegramChannel ?? '',
      tiktokHandle:    body.tiktokHandle    ?? '',
      contentTone:     body.contentTone     ?? 'professional',
      ...(body.autoNurtureOnLead !== undefined ? { autoNurtureOnLead: body.autoNurtureOnLead } : {}),
      ...(body.autoReplyOnLeadCapture !== undefined ? { autoReplyOnLeadCapture: body.autoReplyOnLeadCapture } : {}),
      ...(body.emailFrom !== undefined ? { emailFrom: body.emailFrom } : {}),
      ...(body.emailPassword !== undefined ? { emailPassword: body.emailPassword } : {}),
      ...(body.receptionistEnabled !== undefined ? { receptionistEnabled: body.receptionistEnabled } : {}),
      receptionistName:        body.receptionistName        ?? undefined,
      receptionistHours:       body.receptionistHours       ?? undefined,
      receptionistServices:    body.receptionistServices    ?? undefined,
      receptionistBookingLink: body.receptionistBookingLink ?? undefined,
    },
    create: {
      userId:          session.user.id,
      businessName:    body.businessName    ?? '',
      businessDesc:    body.businessDesc    ?? '',
      telegramToken:   body.telegramToken   ?? '',
      telegramChannel: body.telegramChannel ?? '',
      tiktokHandle:    body.tiktokHandle    ?? '',
      contentTone:     body.contentTone     ?? 'professional',
      autoNurtureOnLead:      body.autoNurtureOnLead      ?? false,
      autoReplyOnLeadCapture: body.autoReplyOnLeadCapture ?? false,
      receptionistEnabled:    body.receptionistEnabled    ?? false,
      receptionistName:        body.receptionistName        ?? 'Assistant',
      receptionistHours:       body.receptionistHours       ?? '',
      receptionistServices:    body.receptionistServices    ?? '',
      receptionistBookingLink: body.receptionistBookingLink ?? '',
    },
  })
  return NextResponse.json(settings)
}
