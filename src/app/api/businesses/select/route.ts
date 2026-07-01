import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'nx_current_business'

// POST { businessId } — select a business (or businessId: null to clear / "All businesses")
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId } = await request.json()
  const jar = await cookies()

  if (!businessId) {
    jar.delete(COOKIE_NAME)
    return NextResponse.json({ success: true })
  }

  const business = await db.business.findUnique({ where: { id: businessId } })
  if (!business || business.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  jar.set(COOKIE_NAME, businessId, { httpOnly: false, sameSite: 'lax', path: '/' })
  return NextResponse.json({ success: true })
}
