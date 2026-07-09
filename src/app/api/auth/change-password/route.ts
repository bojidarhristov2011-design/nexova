import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, next } = await req.json()
  if (!current || !next) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })

  const hashed = await bcrypt.hash(next, 10)
  await db.user.update({ where: { id: session.user.id }, data: { password: hashed } })

  return NextResponse.json({ success: true })
}
