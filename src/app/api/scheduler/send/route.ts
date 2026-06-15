import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const due = await db.scheduledPost.findMany({
    where: {
      userId: session.user.id,
      status: 'pending',
      scheduledAt: { lte: now },
    },
  })

  const results = await Promise.all(due.map(async (post) => {
    try {
      if (post.platform === 'telegram') {
        const token = process.env.TELEGRAM_BOT_TOKEN
        const channelId = process.env.TELEGRAM_CHANNEL_ID
        if (!token || !channelId) throw new Error('Telegram not configured')

        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: channelId, text: post.content, parse_mode: 'HTML' }),
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.description)
      }

      await db.scheduledPost.update({ where: { id: post.id }, data: { status: 'sent' } })
      return { id: post.id, status: 'sent' }
    } catch (e: unknown) {
      await db.scheduledPost.update({ where: { id: post.id }, data: { status: 'failed' } })
      return { id: post.id, status: 'failed', error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }))

  return NextResponse.json({ processed: results.length, results })
}
