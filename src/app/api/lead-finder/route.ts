import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchBusinesses } from '@/lib/leadSearch'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessType, location } = await request.json()
  if (!businessType) return NextResponse.json({ error: 'Business type is required' }, { status: 400 })
  if (!location) return NextResponse.json({ error: 'Location is required' }, { status: 400 })

  try {
    const results = await searchBusinesses(businessType, location)
    return NextResponse.json({ results: results.map(r => ({ ...r, rating: null, reviewCount: 0 })) })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to search businesses' }, { status: 500 })
  }
}
