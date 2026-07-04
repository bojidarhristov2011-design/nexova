import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json({
    receptionistName:        settings?.receptionistName        ?? 'Assistant',
    receptionistHours:       settings?.receptionistHours       ?? '',
    receptionistServices:    settings?.receptionistServices    ?? '',
    receptionistBookingLink: settings?.receptionistBookingLink ?? '',
    receptionistEnabled:     settings?.receptionistEnabled     ?? false,
    businessName:            settings?.businessName            ?? '',
    businessDesc:            settings?.businessDesc            ?? '',
  })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const settings = await db.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      receptionistName:        body.receptionistName        ?? 'Assistant',
      receptionistHours:       body.receptionistHours       ?? '',
      receptionistServices:    body.receptionistServices    ?? '',
      receptionistBookingLink: body.receptionistBookingLink ?? '',
      receptionistEnabled:     body.receptionistEnabled     ?? false,
    },
    create: {
      userId:                  session.user.id,
      receptionistName:        body.receptionistName        ?? 'Assistant',
      receptionistHours:       body.receptionistHours       ?? '',
      receptionistServices:    body.receptionistServices    ?? '',
      receptionistBookingLink: body.receptionistBookingLink ?? '',
      receptionistEnabled:     body.receptionistEnabled     ?? false,
    },
  })
  return NextResponse.json(settings)
}
