import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, features: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await db.user.findUnique({ where: { id: session.user.id } })
  if (!admin?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, slug, enabled } = await req.json()
  if (enabled) {
    await db.userFeature.upsert({
      where: { userId_slug: { userId, slug } },
      update: {},
      create: { userId, slug },
    })
  } else {
    await db.userFeature.deleteMany({ where: { userId, slug } })
  }
  return NextResponse.json({ success: true })
}
