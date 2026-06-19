'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

const TYPES = [
  { value: 'late_delivery',   label: 'Late / not delivered' },
  { value: 'bad_quality',     label: 'Bad quality of work' },
  { value: 'rude_staff',      label: 'Rude or unhelpful service' },
  { value: 'wrong_order',     label: 'Wrong item / service' },
  { value: 'billing_issue',   label: 'Billing or charge problem' },
  { value: 'no_response',     label: 'Slow / no response' },
  { value: 'other',           label: 'Other' },
]

const TONES = [
  { value: 'apologetic',    label: 'Apologetic' },
  { value: 'professional',  label: 'Professional' },
  { value: 'empathetic',    label: 'Empathetic' },
  { value: 'firm',          label: 'Firm but fair' },
]

export default function ComplaintReplyPage() {
  const [complaintType, setComplaintType] = usePersistedState('cr_type', 'bad_quality')
  const [tone, setTone] = usePersistedState('cr_tone', 'apologetic')
  const [businessType, setBusinessType] = usePersistedState('cr_biz', '')
  const [yourName, setYourName] = usePersistedState('cr_name', '')
  const [complaintText, setComplaintText] = usePersistedState('cr_text', '')
  const [output, setOutput] = usePersistedState('cr_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!complaintText) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/complaint-reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintText, complaintType, businessType, tone, yourName }),
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Complaint Reply</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Turn a difficult customer complaint into a professional response that keeps the relationship.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: output ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Type of complaint</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {TYPES.map(t => (
                    <button key={t.value} onClick={() => setComplaintType(t.value)}
                      style={{ background: complaintType === t.value ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${complaintType === t.value ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`, color: complaintType === t.value ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.5rem 0.625rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Tone</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {TONES.map(t => (
                    <button key={t.value} onClick={() => setTone(t.value)}
                      style={{ background: tone === t.value ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${tone === t.value ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`, color: tone === t.value ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Your business type (e.g. photography, salon)" style={inp} />
              <input value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Your name or business name" style={inp} />
              <textarea value={complaintText} onChange={e => setComplaintText(e.target.value)} rows={5} placeholder="Paste the customer complaint here..." style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
          </div>

          <button onClick={generate} disabled={!complaintText || loading}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !complaintText || loading ? 0.5 : 1 }}>
            {loading ? '✍️ Writing reply...' : '✍️ Generate Reply'}
          </button>
        </div>

        {output && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your reply</h2>
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <textarea value={output} onChange={e => setOutput(e.target.value)} rows={16}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.875rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
            <p style={{ color: 'var(--dim)', fontSize: '0.775rem', margin: '0.625rem 0 0' }}>Edit directly in the box above before sending.</p>
          </div>
        )}
      </div>
    </div>
  )
}
