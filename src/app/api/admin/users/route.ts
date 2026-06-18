import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await db.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, plan: true,
      isAdmin: true, blocked: true, planStarted: true, trialEndsAt: true, createdAt: true,
      _count: { select: { agents: true, invoices: true, contacts: true } },
    },
  })

  return NextResponse.json(users)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await db.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, plan, extendTrialDays } = await request.json()

  if (extendTrialDays) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { trialEndsAt: true } })
    const base = user?.trialEndsAt && user.trialEndsAt > new Date() ? user.trialEndsAt : new Date()
    const newTrialEnd = new Date(base.getTime() + extendTrialDays * 24 * 60 * 60 * 1000)
    const updated = await db.user.update({ where: { id: userId }, data: { trialEndsAt: newTrialEnd } })
    return NextResponse.json(updated)
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { plan, planStarted: plan !== 'free' ? new Date() : null },
  })
  return NextResponse.json(updated)
}
