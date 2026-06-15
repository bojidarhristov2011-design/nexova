import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await request.json()

  // Use user's own settings first, fall back to env vars (for admin/owner)
  const settings = await db.userSettings.findUnique({ where: { userId: session.user.id } })
  const token = settings?.telegramToken || process.env.TELEGRAM_BOT_TOKEN
  const channelId = settings?.telegramChannel || process.env.TELEGRAM_CHANNEL_ID

  if (!token) {
    return NextResponse.json({
      error: 'Telegram not configured. Go to Settings and add your bot token and channel.',
    }, { status: 400 })
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: channelId, text: message, parse_mode: 'HTML' }),
  })

  const data = await res.json()
  if (!data.ok) return NextResponse.json({ error: data.description }, { status: 400 })

  return NextResponse.json({ success: true })
}
