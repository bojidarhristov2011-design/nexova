'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

const CURRENCIES = ['€', '$', '£', 'BGN']

export default function PriceListPage() {
  const [businessName, setBusinessName] = usePersistedState('pl_name', '')
  const [businessType, setBusinessType] = usePersistedState('pl_type', '')
  const [tagline, setTagline] = usePersistedState('pl_tagline', '')
  const [services, setServices] = usePersistedState('pl_services', '')
  const [currency, setCurrency] = usePersistedState('pl_currency', '€')
  const [includePackages, setIncludePackages] = usePersistedState('pl_packages', true)
  const [output, setOutput] = usePersistedState('pl_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!businessType || !services) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/price-list', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessType, services, currency, tagline, includePackages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutput(data.content)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  function printList() {
    const w = window.open()
    if (!w) return
    w.document.write(`
      <html><head><title>${businessName || 'Price List'}</title>
      <style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;color:#111;line-height:1.7}pre{white-space:pre-wrap;font-family:inherit}</style>
      </head><body><pre>${output}</pre></body></html>
    `)
    w.print()
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Price List Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate a professional service menu to share with clients or post on social media.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: output ? '320px 1fr' : '560px', gap: '1.5rem', alignItems: 'start', justifyContent: output ? undefined : 'center', margin: output ? undefined : '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1rem' }}>Your business</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Business name (optional)" style={inp} />
              <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Type of business e.g. hair salon, photographer *" style={inp} />
              <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Tagline (optional) e.g. Professional results guaranteed" style={inp} />
              <div style={{ display: 'flex', gap: 8 }}>
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    style={{ background: currency === c ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${currency === c ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`, color: currency === c ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.5rem' }}>Services *</h2>
            <p style={{ color: 'var(--dim)', fontSize: '0.8rem', margin: '0 0 0.875rem' }}>List your services. Include a price if you know it, or just describe the service and AI will suggest a price.</p>
            <textarea value={services} onChange={e => setServices(e.target.value)} rows={7}
              placeholder={`e.g.\nHaircut - €25\nColour - €60\nHighlights - €80\nBlow dry\nKeratin treatment`}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
          </div>

          <div style={{ ...card, padding: '1rem 1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => setIncludePackages(!includePackages)}
                style={{ width: 40, height: 22, background: includePackages ? 'rgba(124,58,237,0.7)' : 'var(--bg2)', border: `1px solid ${includePackages ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`, borderRadius: 99, position: 'relative', transition: 'all 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: includePackages ? 20 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Include bundle packages</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--dim)' }}>Groups services into 2–3 packages with a discount</div>
              </div>
            </label>
          </div>

          <button onClick={generate} disabled={!businessType || !services || loading}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !businessType || !services || loading ? 0.5 : 1 }}>
            {loading ? '⚡ Generating...' : '⚡ Generate Price List'}
          </button>
        </div>

        {output && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your price list</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={printList}
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  🖨️ Print
                </button>
              </div>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} rows={28}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.875rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
            <p style={{ color: 'var(--dim)', fontSize: '0.775rem', margin: '0.625rem 0 0' }}>Edit directly, then copy or print.</p>
          </div>
        )}
      </div>
    </div>
  )
}
