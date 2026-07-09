import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const surveys = await db.survey.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(surveys)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, questions } = await req.json()
  if (!title || !questions) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const survey = await db.survey.create({ data: { userId: session.user.id, title, questions: JSON.stringify(questions) } })
  return NextResponse.json(survey)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.survey.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
