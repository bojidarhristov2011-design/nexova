import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const settings = await db.userSettings.findUnique({ where: { userId } })
  if (!settings?.receptionistEnabled) return NextResponse.json({ error: 'Not active' }, { status: 403 })

  return NextResponse.json({
    businessName:     settings.businessName,
    receptionistName: settings.receptionistName,
  })
}
