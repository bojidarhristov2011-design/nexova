'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const TYPES = [
  { id: 'proposal',          label: '📋 Business Proposal',   desc: 'Pitch your service to a new client' },
  { id: 'followup',          label: '🔔 Follow-Up',           desc: 'Nudge a client who hasn\'t replied' },
  { id: 'invoice_reminder',  label: '💸 Payment Reminder',    desc: 'Ask for an overdue payment' },
  { id: 'thank_you',         label: '🙏 Thank You',           desc: 'After finishing a project' },
  { id: 'cold_outreach',     label: '📨 Cold Outreach',       desc: 'Reach a brand new potential client' },
  { id: 'complaint_response',label: '🛡 Handle Complaint',    desc: 'Respond to an unhappy customer' },
  { id: 'meeting_request',   label: '📅 Request Meeting',     desc: 'Schedule a call or meeting' },
  { id: 'project_update',    label: '📊 Project Update',      desc: 'Update a client on progress' },
]

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const primaryBtn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }
const ghostBtn: React.CSSProperties = { background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }

export default function EmailWriterPage() {
  const [selectedType, setSelectedType] = usePersistedState('email_type', '')
  const [context, setContext] = usePersistedState('email_context', '')
  const [result, setResult] = usePersistedState('email_result', '')
  const [recipientEmail, setRecipientEmail] = usePersistedState('email_recipient', '')
  const [emailSubject, setEmailSubject] = usePersistedState('email_subject', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sendError, setSendError] = useState('')

  async function generate() {
    if (!selectedType) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.content)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function sendEmail() {
    if (!recipientEmail || !result) return
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/email-writer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipientEmail, subject: emailSubject, body: result }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>AI Email Writer</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Write any professional business email in seconds</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Type selector */}
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>1. What kind of email?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  style={{
                    background: selectedType === t.id ? 'rgba(124,58,237,0.12)' : 'var(--bg2)',
                    border: `1px solid ${selectedType === t.id ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
                    color: selectedType === t.id ? '#c4b5fd' : 'var(--muted)',
                    borderRadius: 10, padding: '0.625rem 0.75rem', textAlign: 'left',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>2. Any details? (optional)</h2>
            <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '0.75rem', marginTop: 0 }}>
              E.g. client name, amount owed, project name, your name
            </p>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={3}
              placeholder="Client is John from ABC Agency, invoice amount is €850, due since last week..."
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>

          <button
            onClick={generate}
            disabled={!selectedType || loading}
            style={{ ...primaryBtn, opacity: !selectedType || loading ? 0.5 : 1 }}
          >
            {loading ? '✨ Writing...' : '✨ Write Email'}
          </button>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Email</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copy} style={{ ...ghostBtn, color: copied ? '#86efac' : undefined }}>
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button onClick={generate} style={ghostBtn}>↻ Regenerate</button>
                </div>
              </div>
              <textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                rows={16}
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }}
              />
            </div>

            {/* Send section */}
            <div style={card}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1rem' }}>Send this email</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="Recipient email address..."
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Subject line (optional)..."
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {sendError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                  {sendError}
                </div>
              )}
              <button
                onClick={sendEmail}
                disabled={!recipientEmail || sending}
                style={{ ...primaryBtn, width: '100%', opacity: !recipientEmail || sending ? 0.5 : 1, ...(sent ? { background: 'rgba(34,197,94,0.8)', boxShadow: '0 4px 16px rgba(34,197,94,0.25)' } : {}) }}
              >
                {sending ? 'Sending...' : sent ? '✓ Email Sent!' : '📤 Send Email'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
