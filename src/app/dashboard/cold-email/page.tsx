'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }

const DAYS = [0, 3, 7]

export default function ColdEmailPage() {
  const [targetBusiness, setTargetBusiness] = usePersistedState('cold_target', '')
  const [problem, setProblem] = usePersistedState('cold_problem', '')
  const [offer, setOffer] = usePersistedState('cold_offer', '')
  const [senderName, setSenderName] = usePersistedState('cold_sender', '')
  const [result, setResult] = usePersistedState('cold_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [recipientEmail, setRecipientEmail] = usePersistedState('cold_recipient', '')
  const [sending, setSending] = useState<number | null>(null)
  const [sentIdx, setSentIdx] = useState<number | null>(null)
  const [scheduleDates, setScheduleDates] = usePersistedState<string[]>('cold_sched_dates', ['', '', ''])
  const [scheduling, setScheduling] = useState<number | null>(null)
  const [scheduledIdx, setScheduledIdx] = useState<number[]>([])

  async function generate() {
    if (!targetBusiness || !problem || !offer) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/cold-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetBusiness, problem, offer, senderName }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
      const today = new Date()
      setScheduleDates(DAYS.map(d => {
        const dt = new Date(today); dt.setDate(dt.getDate() + d)
        return dt.toISOString().split('T')[0]
      }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const emails = result ? result.split(/---EMAIL \d+---/).filter(Boolean).map(e => e.trim()) : []

  async function sendEmail(idx: number) {
    if (!recipientEmail || !emails[idx]) return
    setSending(idx)
    try {
      const res = await fetch('/api/email-writer/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject: `Follow-up — Day ${DAYS[idx]}`, body: emails[idx] }),
      })
      if (!res.ok) throw new Error('Failed')
      setSentIdx(idx); setTimeout(() => setSentIdx(null), 3000)
    } catch { /* ignore */ }
    finally { setSending(null) }
  }

  async function scheduleEmail(idx: number) {
    if (!recipientEmail || !emails[idx] || !scheduleDates[idx]) return
    setScheduling(idx)
    try {
      const scheduledAt = new Date(scheduleDates[idx])
      scheduledAt.setHours(9, 0, 0, 0)
      const res = await fetch('/api/scheduled-emails', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject: `Follow-up — Day ${DAYS[idx]}`, body: emails[idx], scheduledAt: scheduledAt.toISOString(), label: `Cold email ${idx + 1} — Day ${DAYS[idx]}` }),
      })
      if (!res.ok) throw new Error('Failed')
      setScheduledIdx(prev => [...prev, idx])
    } catch { /* ignore */ }
    finally { setScheduling(null) }
  }

  function setDate(idx: number, val: string) {
    setScheduleDates(prev => { const next = [...prev]; next[idx] = val; return next })
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Cold Email Sequences</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>AI writes a 3-email follow-up sequence — send now or schedule each one for the right day</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Campaign details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your name (optional)" style={input} />
              <input value={targetBusiness} onChange={e => setTargetBusiness(e.target.value)} placeholder="Target: e.g. yoga studios in London" style={input} />
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={2} placeholder="Problem you solve for them..." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
              <textarea value={offer} onChange={e => setOffer(e.target.value)} rows={2} placeholder="Your offer or service..." style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
            </div>
          </div>

          {emails.length > 0 && (
            <div style={card}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.625rem', marginTop: 0 }}>Recipient email</h2>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="prospect@company.com" style={input} />
            </div>
          )}

          <button onClick={generate} disabled={!targetBusiness || !problem || !offer || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !targetBusiness || !problem || !offer || loading ? 0.5 : 1 }}>
            {loading ? '✨ Writing sequence...' : '✨ Generate 3-Email Sequence'}
          </button>
        </div>

        {emails.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {emails.map((email, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd' }}>
                    EMAIL {i + 1} · DAY {DAYS[i]}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(email); setCopied(i); setTimeout(() => setCopied(null), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied === i ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {copied === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>

                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1rem' }}>{email}</pre>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => sendEmail(i)}
                    disabled={!recipientEmail || sending === i}
                    style={{ background: sentIdx === i ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.1)', color: sentIdx === i ? '#86efac' : '#a78bfa', border: `1px solid ${sentIdx === i ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.25)'}`, borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !recipientEmail || sending === i ? 0.5 : 1 }}
                  >
                    {sending === i ? 'Sending...' : sentIdx === i ? '✓ Sent!' : '📤 Send Now'}
                  </button>

                  <input
                    type="date"
                    value={scheduleDates[i] || ''}
                    onChange={e => setDate(i, e.target.value)}
                    style={{ ...input, width: 'auto', flex: 1, padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                  />

                  <button
                    onClick={() => scheduleEmail(i)}
                    disabled={!recipientEmail || !scheduleDates[i] || scheduling === i || scheduledIdx.includes(i)}
                    style={{ background: scheduledIdx.includes(i) ? 'rgba(34,197,94,0.15)' : 'var(--bg2)', color: scheduledIdx.includes(i) ? '#86efac' : 'var(--muted)', border: `1px solid ${scheduledIdx.includes(i) ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !recipientEmail || !scheduleDates[i] || scheduling === i ? 0.5 : 1 }}
                  >
                    {scheduling === i ? 'Scheduling...' : scheduledIdx.includes(i) ? '✓ Scheduled' : '🗓 Schedule'}
                  </button>
                </div>
              </div>
            ))}
            <p style={{ color: 'var(--dim)', fontSize: '0.8rem', margin: 0 }}>
              Scheduled emails send at 9:00 AM on the selected date. Manage them in the <a href="/dashboard/scheduler" style={{ color: '#a78bfa' }}>Scheduler →</a>
            </p>
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Fill in the details and generate your sequence</p>
          </div>
        )}
      </div>
    </div>
  )
}
