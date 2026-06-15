import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const post = await db.scheduledPost.findFirst({ where: { id, userId: session.user.id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.scheduledPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
