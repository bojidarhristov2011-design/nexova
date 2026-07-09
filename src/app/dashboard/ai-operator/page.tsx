'use client'

import { useState, useRef, useEffect } from 'react'

interface Turn {
  role: 'user' | 'assistant'
  content: string
  actions?: string[]
}

const SUGGESTIONS = [
  'Send a re-engagement email to all customers',
  'Send a follow-up email to all leads',
  'Show me my platform stats',
  'Schedule a promotion email to all customers for tomorrow morning',
  'Add 50 loyalty points to all customers',
  'Who are my leads? Show me the list.',
]

export default function AIOperatorPage() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, loading])

  async function send(text?: string) {
    const msg = text || input
    if (!msg.trim() || loading) return

    const userTurn: Turn = { role: 'user', content: msg }
    setTurns(t => [...t, userTurn])
    const newHistory = [...history, { role: 'user', content: msg }]
    setHistory(newHistory)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      })
      const data = await res.json()
      const reply = data.reply || 'Done.'
      const assistantTurn: Turn = { role: 'assistant', content: reply, actions: data.actions || [] }
      setTurns(t => [...t, assistantTurn])
      setHistory(h => [...h, { role: 'assistant', content: reply }])
    } catch {
      setTurns(t => [...t, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }

    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)', maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>

      {/* Header */}
      <div style={{ padding: '28px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>AI Operator</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Describe a problem — I build the automation and execute it for you</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {['📋 CRM', '📧 Emails', '🎂 Birthdays', '🏆 Loyalty', '⏳ Waitlist', '📊 Stats'].map(cap => (
            <span key={cap} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', fontSize: 12, fontWeight: 500 }}>{cap}</span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 16 }}>

        {turns.length === 0 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>Try one of these:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{ padding: '13px 15px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, cursor: 'pointer', textAlign: 'left', lineHeight: 1.5 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: turn.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
            {turn.role === 'user' ? (
              <div style={{ maxWidth: '75%', padding: '11px 16px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontSize: 14, lineHeight: 1.6 }}>
                {turn.content}
              </div>
            ) : (
              <div style={{ maxWidth: '90%', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: turn.actions && turn.actions.length > 0 ? 10 : 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>⚡</div>
                  <div style={{ flex: 1, padding: '11px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                    {turn.content}
                  </div>
                </div>
                {turn.actions && turn.actions.length > 0 && (
                  <div style={{ marginLeft: 38, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {turn.actions.map((a, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                        <span style={{ color: '#4ade80', fontSize: 14, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: '#4ade80' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(n => (
                  <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', opacity: 0.4, animation: `bounce 1.2s ${n * 0.2}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Working on it...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 0 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="e.g. Send a promotion to all customers, or find clients with birthdays this month..."
            rows={2}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, resize: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{ padding: '0 28px', borderRadius: 10, border: 'none', background: input.trim() && !loading ? 'var(--accent)' : '#374151', color: '#fff', fontWeight: 700, fontSize: 15, cursor: input.trim() && !loading ? 'pointer' : 'default', transition: 'background 0.15s' }}>
            ↑
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 8 }}>Press Enter to send · Shift+Enter for new line</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
