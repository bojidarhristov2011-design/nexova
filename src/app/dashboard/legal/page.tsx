'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function LegalPage() {
  const [docType, setDocType] = usePersistedState('legal_type', 'privacy')
  const [form, setForm] = usePersistedState('legal_form', { businessName: '', businessType: '', website: '', country: '' })
  const [output, setOutput] = usePersistedState('legal_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.businessName || !form.businessType) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/legal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, docType }) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Legal Document Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate a Privacy Policy or Terms & Conditions for your business website in seconds.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[{ v: 'privacy', label: '🔒 Privacy Policy' }, { v: 'terms', label: '📋 Terms & Conditions' }].map(opt => (
          <button key={opt.v} onClick={() => setDocType(opt.v)} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid', borderColor: docType === opt.v ? 'var(--accent)' : 'var(--border)', background: docType === opt.v ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', color: docType === opt.v ? '#c4b5fd' : 'var(--muted)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: output ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div><span style={lbl}>Business Name *</span><input style={inp} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Nexova" /></div>
              <div><span style={lbl}>Business Type *</span><input style={inp} value={form.businessType} onChange={e => set('businessType', e.target.value)} placeholder="e.g. SaaS platform, Marketing agency, E-commerce store" /></div>
              <div><span style={lbl}>Website URL</span><input style={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="e.g. https://nexova.io" /></div>
              <div><span style={lbl}>Country / Jurisdiction</span><input style={inp} value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. European Union, United Kingdom, USA" /></div>
            </div>
          </div>
          <button onClick={generate} disabled={loading || !form.businessName || !form.businessType} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !form.businessName || !form.businessType ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
            {loading ? 'Generating document...' : `Generate ${docType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}`}
          </button>
        </div>

        {output && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{docType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button onClick={() => { const w = window.open(); if (w) { w.document.write(`<pre style="font-family:sans-serif;white-space:pre-wrap;padding:2rem;max-width:800px;margin:0 auto">${output}</pre>`); w.print() } }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  🖨️ Print
                </button>
              </div>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} rows={28} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.875rem', fontSize: '0.8125rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.7 }} />
          </div>
        )}
      </div>
    </div>
  )
}
