'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Where do I find my Lead Capture link?',
  'How do I make follow-up emails send automatically?',
  'How do I send an invoice to a client?',
  'What does the Business Operator do?',
]

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! Ask me anything about how to use Nexova — I know every feature on this platform." },
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
      const res = await fetch('/api/help-bot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(m => [...m, { role: 'assistant', content: data.content }])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>💡 Help & Support</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Ask how to use any part of Nexova — instant answers, no need to message support.</p>
      </div>

      <div style={{ ...card, flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: 14, fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const,
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--bg2)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Thinking...</div>}
        {error && <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: '1rem' }}>
          {SUGGESTIONS.map(s => (
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
          placeholder="Ask a question about Nexova..."
          style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '0.8rem 1rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 12, padding: '0 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  )
}
