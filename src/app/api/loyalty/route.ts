import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, email: true, phone: true, loyaltyPoints: true },
    orderBy: { loyaltyPoints: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { contactId, points } = await req.json()
  const contact = await db.contact.update({
    where: { id: contactId },
    data: { loyaltyPoints: { increment: points } },
  })
  return NextResponse.json(contact)
}
