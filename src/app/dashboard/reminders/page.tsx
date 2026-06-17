'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

export default function RemindersPage() {
  const [form, setForm] = usePersistedState('reminder_form', { clientName: '', service: '', dateTime: '', channel: 'WhatsApp', notes: '' })
  const [result, setResult] = usePersistedState('reminder_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.clientName || !form.service || !form.dateTime) return
    setLoading(true)
    const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setResult(data.content || data.error || 'Error')
    setLoading(false)
  }

  const messages = result ? result.split(/---REMINDER \d+---/).filter(Boolean).map(s => s.trim()) : []
  const labels = ['24 hours before', 'Day of — 2 hours before', 'No-show follow-up']

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Appointment Reminders</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate 3 ready-to-send reminder messages — 24h before, day of, and a no-show follow-up.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Appointment details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Client name *</span>
                <input style={inp} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Sarah" />
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Service / appointment *</span>
                <input style={inp} value={form.service} onChange={e => set('service', e.target.value)} placeholder="e.g. Hair appointment, Consultation call, Yoga class" />
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Date & time *</span>
                <input style={inp} value={form.dateTime} onChange={e => set('dateTime', e.target.value)} placeholder="e.g. Tuesday 17 June at 3:00 PM" />
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Send via</span>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.channel} onChange={e => set('channel', e.target.value)}>
                  <option>WhatsApp</option><option>SMS</option><option>Email</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Notes (optional)</span>
                <input style={inp} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. bring ID, online via Zoom, parking available" />
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={!form.clientName || !form.service || !form.dateTime || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !form.clientName || !form.service || !form.dateTime || loading ? 0.5 : 1 }}>
            {loading ? '✨ Generating...' : '✨ Generate Reminders'}
          </button>
        </div>

        {messages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd', display: 'inline-block' }}>
                      MESSAGE {i + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>{labels[i]}</span>
                  </div>
                  <button onClick={async () => { await navigator.clipboard.writeText(msg); setCopied(i); setTimeout(() => setCopied(null), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied === i ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {copied === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{msg}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Fill in the details and generate your reminders</p>
          </div>
        )}
      </div>
    </div>
  )
}
