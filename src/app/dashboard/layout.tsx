import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { db } from '@/lib/db'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true, plan: true, trialEndsAt: true, blocked: true },
  })

  const actingAs = (session.user as { actingAs?: boolean }).actingAs ?? false

  // A collaborator who was granted access can always get in, even if the
  // owner's trial expired or they were blocked — that's the point of access.
  if (!dbUser?.isAdmin && !actingAs) {
    if (dbUser?.blocked) redirect('/access-ended')
    const trialOver = dbUser?.trialEndsAt && new Date(dbUser.trialEndsAt) < new Date()
    if (trialOver && dbUser?.plan === 'free') redirect('/access-ended')
  }

  return (
    <div className="flex h-full" style={{ background: 'var(--bg)' }}>
      <Sidebar user={session.user} isAdmin={dbUser?.isAdmin ?? false} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
