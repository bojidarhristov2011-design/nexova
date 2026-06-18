'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function QuotesPage() {
  const [form, setForm] = usePersistedState('quote_form', { clientName: '', serviceDesc: '', price: '', currency: '€', validDays: '7' })
  const [output, setOutput] = usePersistedState('quote_output', '')
  const [recipientEmail, setRecipientEmail] = usePersistedState('quote_recipient', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.clientName || !form.serviceDesc || !form.price) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  async function sendQuote() {
    if (!recipientEmail || !output) return
    setSending(true); setSendError('')
    try {
      const res = await fetch('/api/quotes/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: recipientEmail, subject: `Quote for ${form.clientName}`, body: output }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true); setTimeout(() => setSent(false), 4000)
    } catch (e: unknown) { setSendError(e instanceof Error ? e.message : 'Failed') }
    finally { setSending(false) }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Quote Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate a professional price quote to send to clients before the job starts.</p>
      </div>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div><span style={lbl}>Client Name *</span><input style={inp} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. John Smith" /></div>
          <div><span style={lbl}>Quote valid for (days)</span><input style={inp} type="number" value={form.validDays} onChange={e => set('validDays', e.target.value)} placeholder="7" /></div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <span style={lbl}>Service / Work Description *</span>
          <textarea rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={form.serviceDesc} onChange={e => set('serviceDesc', e.target.value)} placeholder="Describe exactly what you'll deliver..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div><span style={lbl}>Currency</span>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.currency} onChange={e => set('currency', e.target.value)}>
              <option value="€">€ EUR</option><option value="$">$ USD</option><option value="£">£ GBP</option>
            </select>
          </div>
          <div><span style={lbl}>Total Price *</span><input style={inp} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="1500" /></div>
        </div>
        <button onClick={generate} disabled={loading || !form.clientName || !form.serviceDesc || !form.price} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !form.clientName || !form.serviceDesc || !form.price ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          {loading ? 'Generating quote...' : 'Generate Quote'}
        </button>
      </div>
      {output && (
        <>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Quote</h2>
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
          </div>
          <div style={card}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.875rem' }}>Send quote to client</h2>
            <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="Client email address..." style={{ ...inp, marginBottom: '0.75rem' }} />
            {sendError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{sendError}</div>}
            <button onClick={sendQuote} disabled={!recipientEmail || sending} style={{ width: '100%', background: sent ? 'rgba(34,197,94,0.8)' : 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !recipientEmail || sending ? 0.5 : 1 }}>
              {sending ? 'Sending...' : sent ? '✓ Quote Sent!' : '📤 Send Quote'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
