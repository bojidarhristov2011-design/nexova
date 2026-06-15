'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const CONTRACT_TYPES = ['Freelance Service Agreement', 'Web Design Contract', 'Marketing Services Contract', 'Consulting Agreement', 'Social Media Management Contract', 'Photography Contract', 'Copywriting Contract']
const CURRENCIES = ['EUR', 'USD', 'GBP', 'BGN']

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }

export default function ContractsPage() {
  const [contractType, setContractType] = usePersistedState('contract_type', '')
  const [clientName, setClientName] = usePersistedState('contract_client', '')
  const [projectDesc, setProjectDesc] = usePersistedState('contract_desc', '')
  const [price, setPrice] = usePersistedState('contract_price', '')
  const [currency, setCurrency] = usePersistedState('contract_currency', 'EUR')
  const [deliveryDays, setDeliveryDays] = usePersistedState('contract_days', '14')
  const [result, setResult] = usePersistedState('contract_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!contractType || !clientName || !projectDesc) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contractType, clientName, projectDesc, price, currency, deliveryDays }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Contract Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate professional contracts in seconds — ready to sign</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Contract details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={contractType} onChange={e => setContractType(e.target.value)} style={{ ...input }}>
                <option value="">Select contract type...</option>
                {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name or company" style={input} />
              <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={3} placeholder="Describe the project or service..." style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Project price" type="number" style={input} />
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={input}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <input value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="Delivery time (days)" type="number" style={input} />
            </div>
          </div>
          <button onClick={generate} disabled={!contractType || !clientName || !projectDesc || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !contractType || !clientName || !projectDesc || loading ? 0.5 : 1 }}>
            {loading ? '📄 Generating...' : '📄 Generate Contract'}
          </button>
        </div>

        {result && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Contract</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button onClick={() => { const w = window.open(); if (w) { w.document.write(`<pre style="font-family:sans-serif;white-space:pre-wrap;padding:2rem">${result}</pre>`); w.print() } }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  🖨️ Print
                </button>
              </div>
            </div>
            <textarea value={result} onChange={e => setResult(e.target.value)} rows={24} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.875rem', fontSize: '0.8125rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.7 }} />
          </div>
        )}
      </div>
    </div>
  )
}
