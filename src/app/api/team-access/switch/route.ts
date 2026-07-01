import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'nx_acting_as'

// POST { targetUserId } — switch into a client's account (must have been granted access)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetUserId } = await request.json()
  if (!targetUserId) return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })

  const grant = await db.teamAccess.findFirst({
    where: {
      ownerId: targetUserId,
      OR: [{ collaboratorId: session.user.id }, { collaboratorEmail: session.user.email }],
    },
  })
  if (!grant) return NextResponse.json({ error: 'You have not been given access to that account' }, { status: 403 })

  const jar = await cookies()
  jar.set(COOKIE_NAME, targetUserId, { httpOnly: true, sameSite: 'lax', path: '/' })
  return NextResponse.json({ success: true })
}

// DELETE — switch back to your own account
export async function DELETE() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
  return NextResponse.json({ success: true })
}
