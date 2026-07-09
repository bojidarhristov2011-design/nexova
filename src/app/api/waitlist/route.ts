import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  const entries = await prisma.waitlistEntry.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })
  const { name, email, phone, service } = await req.json()
  const entry = await prisma.waitlistEntry.create({ data: { userId: session.user.id, name, email: email || null, phone: phone || null, service: service || '' } })
  return NextResponse.json(entry)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })
  const { id, status } = await req.json()
  const entry = await prisma.waitlistEntry.updateMany({ where: { id, userId: session.user.id }, data: { status } })
  return NextResponse.json(entry)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 })
  const { id } = await req.json()
  await prisma.waitlistEntry.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
