import { cookies } from 'next/headers'

const COOKIE_NAME = 'nx_current_business'

export async function getCurrentBusinessId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(COOKIE_NAME)?.value || null
}
