'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; email: string }

export default function ReviewRequestsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [googleLink, setGoogleLink] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(0)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d.filter((c: Contact) => c.email) : []))
    fetch('/api/settings').then(r => r.json()).then(d => setGoogleLink(d.businessName ? '' : ''))
  }, [])

  function toggle(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function sendRequests() {
    if (!googleLink) return alert('Enter your Google review link first')
    if (selected.length === 0) return alert('Select at least one client')
    setSending(true)
    let count = 0
    for (const id of selected) {
      const contact = contacts.find(c => c.id === id)
      if (!contact?.email) continue
      await fetch('/api/email-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email,
          subject: 'We\'d love your feedback!',
          body: `Hi ${contact.name},\n\nThank you for visiting us! We'd love to hear your thoughts.\n\nIf you have a moment, please leave us a Google review:\n${googleLink}\n\nIt means the world to us!\n\nThank you,\nThe Team`,
        }),
      })
      count++
    }
    setSent(count)
    setSending(false)
    setSelected([])
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>⭐ Review Request Sender</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Ask your clients to leave a Google review automatically.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Your Google Review Link</label>
        <input value={googleLink} onChange={e => setGoogleLink(e.target.value)}
          placeholder="https://g.page/r/your-business/review"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Find this in Google Maps → Your business → Get more reviews</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600 }}>Select Clients ({selected.length} selected)</span>
          <button onClick={() => setSelected(selected.length === contacts.length ? [] : contacts.map(c => c.id))}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
            {selected.length === contacts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        {contacts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No contacts with email found. Add contacts in CRM first.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: selected.includes(c.id) ? 'var(--accent-dim)' : 'var(--bg2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{c.email}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {sent > 0 && <p style={{ color: '#4ade80', marginBottom: 16, fontWeight: 600 }}>✓ Sent {sent} review requests!</p>}

      <button onClick={sendRequests} disabled={sending}
        style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
        {sending ? 'Sending...' : `Send Review Requests (${selected.length})`}
      </button>
    </div>
  )
}
