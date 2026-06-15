export interface RSSItem {
  title: string
  summary: string
  source: string
  link?: string
}

export async function fetchRSSItems(feedUrl: string): Promise<RSSItem[]> {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RobotFactory/1.0)' },
    next: { revalidate: 3600 },
  })
  const text = await res.text()

  const items: RSSItem[] = []
  const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g)

  for (const match of itemMatches) {
    const item = match[1]
    const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? ''
    const desc = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
    const link = item.match(/<link>(.*?)<\/link>/)?.[1]?.trim()

    if (title && (
      title.toLowerCase().includes('robot') ||
      title.toLowerCase().includes('humanoid') ||
      title.toLowerCase().includes('ai') ||
      title.toLowerCase().includes('automat')
    )) {
      items.push({ title, summary: desc.slice(0, 200), source: 'IEEE Spectrum', link })
    }
    if (items.length >= 5) break
  }

  return items.length > 0 ? items : getDefaultTopics()
}

function getDefaultTopics(): RSSItem[] {
  return [
    { title: 'Humanoid robots are entering factories worldwide', summary: 'Companies like Tesla, Figure, and Boston Dynamics are deploying humanoid robots at scale', source: 'Industry' },
    { title: 'AI-powered robots learning new tasks in minutes', summary: 'Latest breakthroughs allow robots to learn complex tasks through demonstration', source: 'Tech' },
    { title: 'The race to build the first mass-market home robot', summary: 'Multiple startups competing to bring affordable home robots to consumers', source: 'Industry' },
    { title: 'Robot Factory RF token gaining traction on Solana', summary: 'Early investors backing the vision of community-funded humanoid robots', source: 'RF Token' },
    { title: 'Why humanoid robots will change everything by 2030', summary: 'Experts predict humanoid robots will transform labor markets and daily life', source: 'Future' },
  ]
}
