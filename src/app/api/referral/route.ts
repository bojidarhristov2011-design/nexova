import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, email: true, loyaltyPoints: true },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { referrerId, newClientName, newClientEmail } = await req.json()
  // Create new contact
  const newContact = await db.contact.create({ data: { userId: session.user.id, name: newClientName, email: newClientEmail, notes: `Referred by contact ${referrerId}`, status: 'lead' } })
  // Give referrer 50 points
  await db.contact.update({ where: { id: referrerId }, data: { loyaltyPoints: { increment: 50 } } })
  return NextResponse.json({ success: true, newContact })
}
