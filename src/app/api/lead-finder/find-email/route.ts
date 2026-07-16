import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const JUNK_DOMAINS = [
  'example.com', 'test.com', 'wixpress.com', 'wordpress.com', 'google.com',
  'facebook.com', 'sentry.io', 'schema.org', 'w3.org', 'jquery.com',
  'duckduckgo.com', 'cloudflare.com', 'googletagmanager.com', 'doubleclick.net',
  'bootstrapcdn.com', 'fontawesome.com', 'gstatic.com', 'gravatar.com',
]

function extractEmails(html: string): string[] {
  const raw = [...html.matchAll(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/g)].map(m => m[0].toLowerCase())
  return raw.filter(e =>
    !JUNK_DOMAINS.some(d => e.endsWith('@' + d) || e.includes('.' + d)) &&
    !e.includes('noreply') &&
    !e.includes('no-reply') &&
    !e.includes('example') &&
    !e.startsWith('test@') &&
    e.length < 80
  )
}

async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    const res = await fetch(url.startsWith('http') ? url : 'https://' + url, {
      signal: AbortSignal.timeout(7000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    })
    const html = await res.text()
    const emails = extractEmails(html)
    return emails[0] || null
  } catch {
    return null
  }
}

async function searchWeb(name: string, city: string): Promise<string | null> {
  try {
    const query = `"${name}" ${city} email contact`
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    })
    const html = await res.text()
    const emails = extractEmails(html)
    return emails[0] || null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, city, website } = await req.json()

  let email: string | null = null

  // 1. Scrape website if available
  if (website) {
    email = await scrapeWebsite(website)
  }

  // 2. Fall back to web search
  if (!email) {
    email = await searchWeb(name, city || '')
  }

  return NextResponse.json({ email })
}
