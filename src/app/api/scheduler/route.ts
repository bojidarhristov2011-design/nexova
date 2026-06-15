import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const posts = await db.scheduledPost.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, scheduledAt, platform } = await request.json()
  const post = await db.scheduledPost.create({
    data: {
      userId: session.user.id,
      content,
      scheduledAt: new Date(scheduledAt),
      platform: platform || 'telegram',
      status: 'pending',
    },
  })
  return NextResponse.json(post)
}
