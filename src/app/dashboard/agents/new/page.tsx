import Link from 'next/link'
import { AgentForm } from '@/components/AgentForm'

export default function NewAgentPage() {
  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 640, margin: '0 auto' }}>
      <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
        ← Back to agents
      </Link>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.5rem' }}>
        New Agent
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Configure your AI agent — you can edit this any time.
      </p>
      <AgentForm />
    </div>
  )
}
