import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cards = await db.giftCard.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { amount, recipient } = await req.json()
  const card = await db.giftCard.create({ data: { userId: session.user.id, code: generateCode(), amount, recipient: recipient || '' } })
  return NextResponse.json(card)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, used } = await req.json()
  const card = await db.giftCard.update({ where: { id }, data: { used } })
  return NextResponse.json(card)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.giftCard.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
