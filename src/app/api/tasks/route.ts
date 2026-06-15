import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tasks = await db.task.findMany({ where: { userId: session.user.id }, orderBy: [{ dueDate: 'asc' }, { dueTime: 'asc' }] })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, dueDate, dueTime, category } = await req.json()
  if (!title || !dueDate) return NextResponse.json({ error: 'Title and date required' }, { status: 400 })
  const task = await db.task.create({ data: { userId: session.user.id, title, description, dueDate, dueTime, category } })
  return NextResponse.json(task)
}
