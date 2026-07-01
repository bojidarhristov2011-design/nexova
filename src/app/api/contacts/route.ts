import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { autoScheduleNurture } from '@/lib/automation'
import { getCurrentBusinessId } from '@/lib/currentBusiness'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const contacts = await db.contact.findMany({
    where: { userId: session.user.id, ...(businessId ? { businessId } : {}) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const body = await request.json()
  const contact = await db.contact.create({
    data: {
      userId: session.user.id,
      businessId,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      status: body.status || 'lead',
      notes: body.notes || null,
    },
  })

  if (contact.status === 'lead' && contact.email) {
    const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
    if (settings?.autoNurtureOnLead) await autoScheduleNurture(session.user.id, contact.name, contact.email, contact.company, businessId)
  }

  return NextResponse.json(contact)
}
