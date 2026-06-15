'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AgentData {
  id?: string
  name: string
  description: string
  instructions: string
  greeting: string
  model: string
}

interface Props {
  initial?: AgentData
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 10,
  padding: '0.75rem 1rem',
  fontSize: '0.9375rem',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--muted)',
  display: 'block',
  marginBottom: 6,
}

const hintStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--dim)',
  marginTop: 4,
}

export function AgentForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [form, setForm] = useState<AgentData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    instructions: initial?.instructions ?? 'You are a helpful assistant.',
    greeting: initial?.greeting ?? 'Hello! How can I help you today?',
    model: initial?.model ?? 'llama-3.3-70b-versatile',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof AgentData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(isEdit ? `/api/agents/${initial!.id}` : '/api/agents', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }
    const agent = await res.json()
    router.push(`/dashboard/agents/${agent.id}/test`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>Agent name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Support Bot, Sales Assistant"
          required
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <input
          type="text"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="What does this agent do?"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <div>
        <label style={labelStyle}>Instructions (system prompt)</label>
        <textarea
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          rows={6}
          placeholder="Describe the agent's role, tone, and what it should and shouldn't do."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <p style={hintStyle}>This is the agent's core behaviour. Be specific — the more detail, the better the agent performs.</p>
      </div>

      <div>
        <label style={labelStyle}>Greeting message</label>
        <input
          type="text"
          value={form.greeting}
          onChange={e => set('greeting', e.target.value)}
          placeholder="Hello! How can I help you today?"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <p style={hintStyle}>The first message users see when they open the chat.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', paddingTop: 4 }}>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
        >
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create agent'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '0.875rem 1.25rem', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 10, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
