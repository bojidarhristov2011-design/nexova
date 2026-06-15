import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AgentForm } from '@/components/AgentForm'

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const agent = await db.agent.findFirst({ where: { id, userId: session!.user.id } })
  if (!agent) notFound()

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
        ← Back to agents
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.5rem' }}>
        Edit Agent
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Changes take effect immediately.
      </p>
      <AgentForm
        initial={{
          id: agent.id,
          name: agent.name,
          description: agent.description ?? '',
          instructions: agent.instructions,
          greeting: agent.greeting,
          model: agent.model,
        }}
      />
    </div>
  )
}
