'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

const MESSAGE_TYPES = [
  { value: 'followup',   label: 'Follow-up',           desc: 'Chase a lead or prospect' },
  { value: 'promo',      label: 'Promotion',            desc: 'Announce an offer or product' },
  { value: 'appointment',label: 'Appointment Reminder', desc: 'Remind about a booked meeting' },
  { value: 'thank_you',  label: 'Thank You',            desc: 'After a purchase or meeting' },
  { value: 're_engage',  label: 'Win Back',             desc: 'Re-engage an inactive customer' },
  { value: 'invoice',    label: 'Payment Reminder',     desc: 'Polite overdue invoice nudge' },
]

const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'promotional', label: 'Promotional' },
]

export default function WhatsAppPage() {
  const [type, setType] = usePersistedState('wa_type', 'followup')
  const [tone, setTone] = usePersistedState('wa_tone', 'friendly')
  const [context, setContext] = usePersistedState('wa_context', '')
  const [output, setOutput] = usePersistedState('wa_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setOutput('')
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, tone, context }),
    })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error generating message.')
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>WhatsApp Messages</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate ready-to-send WhatsApp Business messages for any situation.</p>
      </div>

      <div style={card}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>Message Type</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MESSAGE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{ background: type === t.value ? 'rgba(124,58,237,0.1)' : 'var(--bg2)', border: `1px solid ${type === t.value ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`, color: type === t.value ? '#c4b5fd' : 'var(--muted)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              style={{ background: tone === t.value ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${tone === t.value ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, color: tone === t.value ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>Extra context (optional)</span>
          <input
            style={inp}
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. Offer expires Sunday, 20% discount on all services"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}
        >
          {loading ? 'Writing message...' : 'Generate Message'}
        </button>
      </div>

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your WhatsApp Message</h2>
            <button onClick={copy} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          {/* WhatsApp bubble preview */}
          <div style={{ background: '#0a1628', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#005c4b', color: '#e9edef', borderRadius: '12px 12px 0 12px', padding: '0.625rem 0.875rem', maxWidth: '85%', marginLeft: 'auto', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {output}
            </div>
          </div>
          <p style={{ color: 'var(--dim)', fontSize: '0.75rem', margin: 0 }}>Preview shown above. Click Copy to use the text.</p>
        </div>
      )}
    </div>
  )
}
