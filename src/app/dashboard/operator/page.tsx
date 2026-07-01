'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string; actions?: Array<{ tool: string; result: unknown }> }

const TOOL_LABELS: Record<string, string> = {
  add_contact: '👥 Added contact',
  list_contacts: '👥 Looked up contacts',
  create_invoice: '🧾 Created invoice',
  list_invoices: '🧾 Looked up invoices',
  schedule_email: '📧 Scheduled email',
  schedule_social_post: '📅 Scheduled post',
  search_businesses: '🔍 Searched businesses',
}

const PERSONAS = [
  { key: 'general',    icon: '◈', label: 'General',           desc: 'All tools — CRM, invoices, emails, posts' },
  { key: 'copywriter', icon: '✍️', label: 'Copywriter',        desc: 'Writes and schedules social content' },
  { key: 'researcher', icon: '🔍', label: 'Lead Researcher',   desc: 'Finds real businesses, adds to CRM' },
  { key: 'outreach',   icon: '📨', label: 'Outreach Specialist', desc: 'Drafts and schedules follow-up emails' },
]

const SUGGESTIONS: Record<string, string[]> = {
  general: [
    'Add a new lead: Maria, maria@example.com, interested in a website redesign',
    'Create an invoice for John Smith (john@example.com) — €450 for logo design, due in 14 days',
    'Show me all my leads that aren\'t customers yet',
  ],
  copywriter: [
    'Write an Instagram caption about our weekend promotion and schedule it for Saturday 10am',
    'Write 3 LinkedIn posts about our services this week and schedule them',
  ],
  researcher: [
    'Find hair salons in Burgas, Bulgaria and add the best ones as leads',
    'Search for restaurants in Sofia and show me what you find',
  ],
  outreach: [
    'Write and schedule a follow-up email to client@example.com for next Monday at 9am',
    'Draft a re-engagement email for a lead who went quiet',
  ],
}

export default function OperatorPage() {
  const [persona, setPersona] = useState('general')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Business Operator. Pick a specialist above, or just talk to me directly — I can actually add contacts, create invoices, find leads, and schedule emails or posts." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput(''); setLoading(true); setError('')
    try {
      const res = await fetch('/api/operator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, persona }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(m => [...m, { role: 'assistant', content: data.content, actions: data.actions }])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>◈ Business Operator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>An AI agent that actually does things — pick a specialist for the right tools and focus.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
        {PERSONAS.map(p => (
          <button key={p.key} onClick={() => setPersona(p.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: persona === p.key ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${persona === p.key ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, color: persona === p.key ? '#c4b5fd' : 'var(--muted)', borderRadius: 10, padding: '0.5rem 0.875rem', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            title={p.desc}>
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </div>

      <div style={{ ...card, flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
            <div style={{
              maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: 14, fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--bg2)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {m.content}
            </div>
            {m.actions && m.actions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {m.actions.map((a, j) => (
                  <span key={j} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac', borderRadius: 8, padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    {TOOL_LABELS[a.tool] || a.tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Working...</div>}
        {error && <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
          {(SUGGESTIONS[persona] || SUGGESTIONS.general).map(s => (
            <button key={s} onClick={() => send(s)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 10, padding: '0.5rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Tell it what to do..."
          style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '0.8rem 1rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 12, padding: '0 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  )
}
