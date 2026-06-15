'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteAgentButton({ agentId }: { agentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this agent? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
    >
      {loading ? '…' : 'Delete'}
    </button>
  )
}
