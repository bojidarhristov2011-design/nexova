'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

interface Result {
  placeId: string
  name: string
  address: string
  phone: string
  website: string
  rating: number | null
  reviewCount: number
}

export default function LeadFinderPage() {
  const [businessType, setBusinessType] = usePersistedState('lf_type', '')
  const [location, setLocation] = usePersistedState('lf_location', '')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState<string[]>([])

  async function search() {
    if (!businessType || !location) return
    setLoading(true); setError(''); setResults([])
    try {
      const res = await fetch('/api/lead-finder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, location }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  async function addToCRM(r: Result) {
    await fetch('/api/contacts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: r.name, phone: r.phone, company: r.name, status: 'lead', notes: `Found via Lead Finder${r.website ? ` — ${r.website}` : ''}${r.address ? ` — ${r.address}` : ''}` }),
    })
    setAdded(prev => [...prev, r.placeId])
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Lead Finder</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Search real businesses by type and location, then add the ones you want straight to your CRM.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{error}</div>
      )}

      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Business type e.g. hair salons *" style={inp} onKeyDown={e => e.key === 'Enter' && search()} />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location e.g. Sofia, Bulgaria *" style={inp} onKeyDown={e => e.key === 'Enter' && search()} />
        </div>
        <button onClick={search} disabled={!businessType || !location || loading}
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', opacity: !businessType || !location || loading ? 0.5 : 1 }}>
          {loading ? '🔍 Searching...' : '🔍 Find Businesses'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.625rem' }}>
          {results.map(r => (
            <div key={r.placeId} style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{r.name}</span>
                  {r.rating && <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>★ {r.rating} ({r.reviewCount})</span>}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>
                  {[r.phone, r.address].filter(Boolean).join(' · ')}
                </div>
                {r.website && <a href={r.website} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontSize: '0.78rem' }}>{r.website}</a>}
              </div>
              <button onClick={() => addToCRM(r)} disabled={added.includes(r.placeId)}
                style={{ background: added.includes(r.placeId) ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: added.includes(r.placeId) ? '#86efac' : 'var(--muted)', border: `1px solid ${added.includes(r.placeId) ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`, borderRadius: 8, padding: '0.45rem 0.875rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                {added.includes(r.placeId) ? '✓ Added' : '+ Add to CRM'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
