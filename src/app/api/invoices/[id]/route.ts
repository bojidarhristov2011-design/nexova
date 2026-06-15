import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const invoice = await db.invoice.findFirst({ where: { id, userId: session.user.id } })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.invoice.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const invoice = await db.invoice.findFirst({ where: { id, userId: session.user.id } })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.invoice.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
