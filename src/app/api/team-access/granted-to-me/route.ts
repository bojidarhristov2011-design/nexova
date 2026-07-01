import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: accounts I've been invited into (as a collaborator)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const grants = await db.teamAccess.findMany({
    where: { OR: [{ collaboratorId: session.user.id }, { collaboratorEmail: session.user.email }] },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(grants.map(g => ({ ownerId: g.ownerId, ownerName: g.owner.name, ownerEmail: g.owner.email })))
}
