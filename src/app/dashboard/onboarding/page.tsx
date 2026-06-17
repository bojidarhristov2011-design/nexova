'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function OnboardingPage() {
  const [form, setForm] = usePersistedState('onboard_form', { clientName: '', serviceType: '', startDate: '', notes: '' })
  const [output, setOutput] = usePersistedState('onboard_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.clientName || !form.serviceType) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Client Onboarding</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate a complete onboarding plan, welcome message, and checklist for every new client.</p>
      </div>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div><span style={lbl}>Client Name *</span><input style={inp} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Sarah Johnson" /></div>
          <div><span style={lbl}>Start Date</span><input style={inp} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <span style={lbl}>Service / Project Type *</span>
          <input style={inp} value={form.serviceType} onChange={e => set('serviceType', e.target.value)} placeholder="e.g. Social media management, Website design, Monthly retainer..." />
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>Additional Notes</span>
          <textarea rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anything specific about this client or project..." />
        </div>
        <button onClick={generate} disabled={loading || !form.clientName || !form.serviceType} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !form.clientName || !form.serviceType ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          {loading ? 'Building onboarding plan...' : '🚀 Generate Onboarding Plan'}
        </button>
      </div>
      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Onboarding Plan for {form.clientName}</h2>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </div>
  )
}
