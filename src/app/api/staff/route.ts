import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const staff = await db.staff.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(staff)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, role, email, phone } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const member = await db.staff.create({ data: { userId: session.user.id, name, role: role || '', email, phone } })
  return NextResponse.json(member)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.staff.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
