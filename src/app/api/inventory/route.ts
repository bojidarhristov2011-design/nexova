import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await db.inventoryItem.findMany({ where: { userId: session.user.id }, orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, quantity, unit, lowAlert } = await req.json()
  const item = await db.inventoryItem.create({ data: { userId: session.user.id, name, quantity: quantity ?? 0, unit: unit ?? '', lowAlert: lowAlert ?? 5 } })
  return NextResponse.json(item)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, quantity } = await req.json()
  const item = await db.inventoryItem.update({ where: { id }, data: { quantity } })
  return NextResponse.json(item)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.inventoryItem.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
