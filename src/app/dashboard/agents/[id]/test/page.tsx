import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChatInterface } from '@/components/ChatInterface'
import { CopyButton } from '@/components/CopyButton'

export default async function TestAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const agent = await db.agent.findFirst({ where: { id, userId: session!.user.id } })
  if (!agent) notFound()

  const publicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/chat/${agent.id}`
  const embedCode = `<iframe src="${publicUrl}" width="400" height="600" frameborder="0" style="border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.3)"></iframe>`

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: '0.875rem' }}>← Dashboard</Link>
          <span style={{ color: 'var(--dim)' }}>/</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{agent.name}</span>
          <span style={{ marginLeft: 'auto', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 500 }}>Test mode</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ChatInterface agentId={agent.id} agentName={agent.name} greeting={agent.greeting} />
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 320, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        <div>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Deploy</h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: 6 }}>Shareable link</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <input readOnly value={publicUrl} style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--dim)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.75rem', outline: 'none', minWidth: 0 }} />
                <CopyButton text={publicUrl} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: 6 }}>Embed code</p>
              <textarea readOnly value={embedCode} rows={3} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--dim)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.6875rem', outline: 'none', resize: 'none', fontFamily: 'monospace', lineHeight: 1.5 }} />
              <CopyButton text={embedCode} label="Copy embed" />
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Agent config</h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--dim)' }}>Model</span>
              <span style={{ color: 'var(--muted)' }}>Llama 3.3 70B</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
              <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: 4 }}>Instructions</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{agent.instructions}</p>
            </div>
          </div>
          <Link href={`/dashboard/agents/${agent.id}`} style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', textDecoration: 'none', borderRadius: 8, padding: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            Edit agent
          </Link>
        </div>
      </div>
    </div>
  )
}
