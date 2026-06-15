'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

const PLATFORMS = ['Google', 'Facebook', 'TripAdvisor', 'Trustpilot', 'Yelp', 'App Store']

export default function ReviewsPage() {
  const [form, setForm] = usePersistedState('review_form', { review: '', stars: '5', platform: 'Google' })
  const [output, setOutput] = usePersistedState('review_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.review) return
    setLoading(true)
    setOutput('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error generating response.')
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stars = parseInt(form.stars)
  const starColor = stars >= 4 ? '#fbbf24' : stars === 3 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Review Responder</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Paste any customer review and get a professional, human-sounding reply instantly.</p>
      </div>

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={lbl}>Platform</span>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.platform} onChange={e => set('platform', e.target.value)}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <span style={lbl}>Star Rating</span>
            <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => set('stars', String(n))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: n <= stars ? starColor : 'var(--border)', padding: '0 2px', lineHeight: 1 }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>Customer Review *</span>
          <textarea
            rows={5}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
            value={form.review}
            onChange={e => set('review', e.target.value)}
            placeholder="Paste the customer review here..."
          />
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.review}
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !form.review) ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}
        >
          {loading ? 'Writing response...' : 'Generate Response'}
        </button>
      </div>

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Response</h2>
            <button onClick={copy} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>{output}</p>
        </div>
      )}
    </div>
  )
}
