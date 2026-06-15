import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const contact = await db.contact.create({
    data: {
      userId: session.user.id,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      status: body.status || 'lead',
      notes: body.notes || null,
    },
  })
  return NextResponse.json(contact)
}
