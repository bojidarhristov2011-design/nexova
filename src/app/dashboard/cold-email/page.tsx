'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }

export default function ColdEmailPage() {
  const [targetBusiness, setTargetBusiness] = usePersistedState('cold_target', '')
  const [problem, setProblem] = usePersistedState('cold_problem', '')
  const [offer, setOffer] = usePersistedState('cold_offer', '')
  const [senderName, setSenderName] = usePersistedState('cold_sender', '')
  const [result, setResult] = usePersistedState('cold_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function generate() {
    if (!targetBusiness || !problem || !offer) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/cold-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetBusiness, problem, offer, senderName }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  // Parse the 3 emails from result
  const emails = result ? result.split(/---EMAIL \d+---/).filter(Boolean).map(e => e.trim()) : []

  async function copyEmail(idx: number) {
    await navigator.clipboard.writeText(emails[idx])
    setCopied(idx); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Cold Email Sequences</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>AI writes a 3-email follow-up sequence — Day 1, Day 3, Day 7</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Campaign details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your name (optional)" style={input} />
              <input value={targetBusiness} onChange={e => setTargetBusiness(e.target.value)} placeholder="Target: e.g. yoga studios in London" style={input} />
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={2} placeholder="Problem you solve for them..." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
              <textarea value={offer} onChange={e => setOffer(e.target.value)} rows={2} placeholder="Your offer or service..." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
            </div>
          </div>
          <button onClick={generate} disabled={!targetBusiness || !problem || !offer || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !targetBusiness || !problem || !offer || loading ? 0.5 : 1 }}>
            {loading ? '✨ Writing sequence...' : '✨ Generate 3-Email Sequence'}
          </button>
        </div>

        {emails.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {emails.map((email, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd' }}>
                      EMAIL {i + 1} · DAY {[1, 3, 7][i]}
                    </div>
                  </div>
                  <button onClick={() => copyEmail(i)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied === i ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {copied === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{email}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Fill in the details and generate your sequence</p>
          </div>
        )}
      </div>
    </div>
  )
}
