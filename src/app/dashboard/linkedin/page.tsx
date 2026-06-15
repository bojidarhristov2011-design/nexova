'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const TYPES = [
  { id: 'connection', label: '🤝 Connection Request', desc: 'First-touch, 300 char limit' },
  { id: 'followup', label: '📬 Follow-Up', desc: 'After connecting' },
  { id: 'sales', label: '💼 Sales Outreach', desc: 'Problem-focused pitch' },
  { id: 'testimonial', label: '⭐ Ask for Testimonial', desc: 'Request a recommendation' },
  { id: 'collaboration', label: '🤜 Collaboration Pitch', desc: 'Partnership proposal' },
]

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const btn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }

export default function LinkedInPage() {
  const [selectedType, setSelectedType] = usePersistedState('linkedin_type', '')
  const [context, setContext] = usePersistedState('linkedin_context', '')
  const [result, setResult] = usePersistedState('linkedin_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!selectedType) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/linkedin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: selectedType, context }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>LinkedIn Messages</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>AI-written LinkedIn outreach that gets replies</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>1. Message type</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setSelectedType(t.id)} style={{ background: selectedType === t.id ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${selectedType === t.id ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, color: selectedType === t.id ? '#c4b5fd' : 'var(--muted)', borderRadius: 10, padding: '0.625rem 0.875rem', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>2. Context (optional)</h2>
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={3} placeholder="Who are you reaching out to? Their company, role, mutual connection, why them specifically..." style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
          </div>

          <button onClick={generate} disabled={!selectedType || loading} style={{ ...btn, opacity: !selectedType || loading ? 0.5 : 1 }}>
            {loading ? '✨ Writing...' : '✨ Write Message'}
          </button>
        </div>

        {result && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Message</h2>
              <button onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            {/* LinkedIn bubble preview */}
            <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>in</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--dim)', paddingTop: 4 }}>LinkedIn Message Preview</div>
              </div>
              <p style={{ color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{result}</p>
            </div>
            <textarea value={result} onChange={e => setResult(e.target.value)} rows={8} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
          </div>
        )}
      </div>
    </div>
  )
}
