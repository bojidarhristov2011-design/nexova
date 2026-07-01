'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

const GOALS = ['Get more leads', 'Drive sales', 'Build awareness', 'Get bookings/appointments', 'Grow followers']
const PLATFORMS = ['Instagram', 'Facebook', 'Both']

export default function AdCopyPage() {
  const [businessType, setBusinessType] = usePersistedState('ad_type', '')
  const [product, setProduct] = usePersistedState('ad_product', '')
  const [audience, setAudience] = usePersistedState('ad_audience', '')
  const [goal, setGoal] = usePersistedState('ad_goal', 'Get more leads')
  const [platform, setPlatform] = usePersistedState('ad_platform', 'Instagram')
  const [output, setOutput] = usePersistedState('ad_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!businessType || !product) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ad-copy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, product, audience, goal, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutput(data.content)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Meta Ad Copy Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Write headlines, primary text, and CTAs for Facebook & Instagram ads. Paste straight into Meta Ads Manager.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: output ? '320px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Business type *" style={inp} />
              <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Product/service being advertised *" style={inp} />
              <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Target audience e.g. women 25-40 in London" style={inp} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Goal</span>
                <select value={goal} onChange={e => setGoal(e.target.value)} style={inp}>
                  {GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Platform</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setPlatform(p)}
                      style={{ background: platform === p ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${platform === p ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`, color: platform === p ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={!businessType || !product || loading}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !businessType || !product || loading ? 0.5 : 1 }}>
            {loading ? '📣 Writing ad copy...' : '📣 Generate Ad Copy'}
          </button>
        </div>

        {output && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Ad copy variations</h2>
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} rows={20}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.875rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.7 }} />
          </div>
        )}
      </div>
    </div>
  )
}
