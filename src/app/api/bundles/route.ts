import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const bundles = await db.bundle.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(bundles)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, description, services, price } = await req.json()
  const bundle = await db.bundle.create({ data: { userId: session.user.id, name, description: description || '', services: JSON.stringify(services), price } })
  return NextResponse.json(bundle)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.bundle.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
