'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }

const DAYS = [0, 3, 7]

function parseContacts(text: string) {
  return text.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(',').map(p => p.trim())
      return { name: parts[0] || '', email: parts[1] || '' }
    })
    .filter(c => c.name && c.email && c.email.includes('@'))
}

export default function ColdEmailPage() {
  const [tab, setTab] = useState<'sequence' | 'bulk'>('bulk')

  // Sequence tab
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

  // Bulk tab
  const [bulkContacts, setBulkContacts] = usePersistedState('bulk_contacts', '')
  const [bulkOffer, setBulkOffer] = usePersistedState('bulk_offer', '')
  const [bulkProblem, setBulkProblem] = usePersistedState('bulk_problem', '')
  const [bulkTarget, setBulkTarget] = usePersistedState('bulk_target', '')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResults, setBulkResults] = useState<{ name: string; email: string; success: boolean }[]>([])
  const [bulkTemplate, setBulkTemplate] = useState('')
  const [bulkError, setBulkError] = useState('')

  const parsedContacts = parseContacts(bulkContacts)

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

  async function sendBulk() {
    if (!parsedContacts.length) return
    setBulkLoading(true); setBulkError(''); setBulkResults([]); setBulkTemplate('')
    try {
      const res = await fetch('/api/cold-email/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: parsedContacts, offer: bulkOffer, problem: bulkProblem, target: bulkTarget }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBulkResults(data.results)
      setBulkTemplate(data.template)
    } catch (e: unknown) {
      setBulkError(e instanceof Error ? e.message : 'Failed')
    }
    setBulkLoading(false)
  }

  const sent = bulkResults.filter(r => r.success).length
  const failed = bulkResults.filter(r => !r.success).length

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Cold Email</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Send cold emails to potential clients automatically</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {([['bulk', 'Bulk Campaign'], ['sequence', '3-Email Sequence']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: tab === id ? '2px solid var(--accent)' : '1px solid transparent', background: tab === id ? 'var(--surface)' : 'transparent', color: tab === id ? 'var(--text)' : 'var(--muted)', fontWeight: tab === id ? 600 : 400, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* BULK TAB */}
      {tab === 'bulk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={card}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>Campaign details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={bulkTarget} onChange={e => setBulkTarget(e.target.value)} placeholder="Target: e.g. козметични салони" style={input} />
                <textarea value={bulkProblem} onChange={e => setBulkProblem(e.target.value)} rows={2} placeholder="Problem you solve: e.g. губят клиенти след първото посещение" style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
                <textarea value={bulkOffer} onChange={e => setBulkOffer(e.target.value)} rows={2} placeholder="Your offer: e.g. AI система, която автоматично пише на изчезналите клиенти" style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            </div>

            <div style={card}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, marginTop: 0 }}>Contact list</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '0 0 10px' }}>One per line: <strong>Име, имейл</strong></p>
              <textarea
                value={bulkContacts}
                onChange={e => setBulkContacts(e.target.value)}
                rows={8}
                placeholder={'Салон Елена, elena@salon.bg\nКозметик Мария, maria@beauty.bg\nСтудио Виктория, v@studio.bg'}
                style={{ ...input, resize: 'vertical', lineHeight: 1.6, fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}
              />
              {parsedContacts.length > 0 && (
                <p style={{ color: '#a78bfa', fontSize: '0.8rem', margin: '8px 0 0' }}>✓ {parsedContacts.length} valid contacts detected</p>
              )}
            </div>

            <button onClick={sendBulk} disabled={!parsedContacts.length || bulkLoading}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: parsedContacts.length && !bulkLoading ? 'pointer' : 'default', fontFamily: 'inherit', opacity: !parsedContacts.length || bulkLoading ? 0.5 : 1 }}>
              {bulkLoading ? `Sending to ${parsedContacts.length} contacts...` : `Send to ${parsedContacts.length} contact${parsedContacts.length !== 1 ? 's' : ''}`}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bulkError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem' }}>{bulkError}</div>
            )}

            {bulkResults.length > 0 && (
              <div style={card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '8px 16px', color: '#4ade80', fontWeight: 700, fontSize: '1.1rem' }}>
                    ✓ {sent} sent
                  </div>
                  {failed > 0 && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 16px', color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem' }}>
                      ✗ {failed} failed
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bulkResults.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: r.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${r.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                      <span style={{ color: r.success ? '#4ade80' : '#fca5a5', fontSize: 14 }}>{r.success ? '✓' : '✗'}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{r.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkTemplate && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Email template used</h3>
                  <button onClick={() => navigator.clipboard.writeText(bulkTemplate)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Copy
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{bulkTemplate}</pre>
              </div>
            )}

            {!bulkResults.length && !bulkLoading && (
              <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Paste your contact list and click Send</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEQUENCE TAB */}
      {tab === 'sequence' && (
        <div>
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
              <button onClick={generate} disabled={!targetBusiness || !problem || !offer || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !targetBusiness || !problem || !offer || loading ? 0.5 : 1 }}>
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
                        {copied === i ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 1rem' }}>{email}</pre>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => sendEmail(i)} disabled={!recipientEmail || sending === i}
                        style={{ background: sentIdx === i ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.1)', color: sentIdx === i ? '#86efac' : '#a78bfa', border: `1px solid ${sentIdx === i ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.25)'}`, borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !recipientEmail || sending === i ? 0.5 : 1 }}>
                        {sending === i ? 'Sending...' : sentIdx === i ? '✓ Sent!' : 'Send Now'}
                      </button>
                      <input type="date" value={scheduleDates[i] || ''} onChange={e => setDate(i, e.target.value)} style={{ ...input, width: 'auto', flex: 1, padding: '0.375rem 0.75rem', fontSize: '0.8rem' }} />
                      <button onClick={() => scheduleEmail(i)} disabled={!recipientEmail || !scheduleDates[i] || scheduling === i || scheduledIdx.includes(i)}
                        style={{ background: scheduledIdx.includes(i) ? 'rgba(34,197,94,0.15)' : 'var(--bg2)', color: scheduledIdx.includes(i) ? '#86efac' : 'var(--muted)', border: `1px solid ${scheduledIdx.includes(i) ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: !recipientEmail || !scheduleDates[i] || scheduling === i ? 0.5 : 1 }}>
                        {scheduling === i ? 'Scheduling...' : scheduledIdx.includes(i) ? '✓ Scheduled' : 'Schedule'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Fill in the details and generate your sequence</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
