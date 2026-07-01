import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: people I (the owner) have given access to my account
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const grants = await db.teamAccess.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(grants)
}

// POST: invite someone (by email) to access my account
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  if (email.toLowerCase() === session.user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You can't invite yourself" }, { status: 400 })
  }

  const matchedUser = await db.user.findUnique({ where: { email } })

  const grant = await db.teamAccess.upsert({
    where: { ownerId_collaboratorEmail: { ownerId: session.user.id, collaboratorEmail: email } },
    update: { collaboratorId: matchedUser?.id || null },
    create: { ownerId: session.user.id, collaboratorEmail: email, collaboratorId: matchedUser?.id || null },
  })
  return NextResponse.json(grant)
}
