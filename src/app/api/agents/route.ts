import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const agents = await db.agent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(agents)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, instructions, greeting, model } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const agent = await db.agent.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
      instructions: instructions || 'You are a helpful assistant.',
      greeting: greeting || 'Hello! How can I help you today?',
      model: model || 'claude-haiku-4-5-20251001',
    },
  })
  return NextResponse.json(agent, { status: 201 })
}
