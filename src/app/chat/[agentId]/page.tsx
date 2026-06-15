import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/ChatInterface'

export default async function PublicChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const agent = await db.agent.findUnique({ where: { id: agentId } })
  if (!agent) notFound()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ flex: 1, maxWidth: 760, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ChatInterface agentId={agent.id} agentName={agent.name} greeting={agent.greeting} />
      </div>
      <div style={{ textAlign: 'center', padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>
          Powered by{' '}
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nexova</span>
        </span>
      </div>
    </div>
  )
}
