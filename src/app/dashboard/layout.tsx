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
    select: { isAdmin: true, plan: true, trialEndsAt: true },
  })

  if (!dbUser?.isAdmin && dbUser?.plan === 'free') {
    const trialEnd = dbUser.trialEndsAt ? new Date(dbUser.trialEndsAt) : null
    if (!trialEnd || trialEnd < new Date()) {
      redirect('/upgrade')
    }
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
