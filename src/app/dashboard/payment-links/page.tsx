'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; email: string }

export default function PaymentLinksPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [links, setLinks] = useState<{ id: string; client: string; amount: string; description: string; link: string; created: string }[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d.filter((c: Contact) => c.email) : []))
  }, [])

  function generate() {
    if (!amount || !clientId) return
    const client = contacts.find(c => c.id === clientId)
    const link = `https://buy.stripe.com/test_placeholder?amount=${Math.round(parseFloat(amount) * 100)}&client=${encodeURIComponent(client?.name || '')}&desc=${encodeURIComponent(description)}`
    setLinks(l => [{ id: Date.now().toString(), client: client?.name || '', amount, description, link, created: new Date().toLocaleDateString() }, ...l])
    setAmount(''); setDescription(''); setClientId('')
  }

  function copy(id: string, link: string) {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>💳 Payment Links</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Generate payment links to send to clients.</p>

      <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13, color: '#fbbf24' }}>
        ⚠️ To use real payments, connect your Stripe account in Settings. For now, links are placeholders you can customize.
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create Payment Link</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select value={clientId} onChange={e => setClientId(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14 }}>
            <option value="">Select client...</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount (€)"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description e.g. Laser session x3"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          <button onClick={generate} disabled={!amount || !clientId}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Generate Link
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Generated Links ({links.length})</h2>
        {links.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No links yet.</p> :
          links.map(l => (
            <div key={l.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700 }}>€{l.amount}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 8 }}>→ {l.client}</span>
                  {l.description && <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>({l.description})</span>}
                </div>
                <button onClick={() => copy(l.id, l.link)}
                  style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: copied === l.id ? '#22c55e' : 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {copied === l.id ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.link}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
