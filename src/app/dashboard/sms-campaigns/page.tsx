'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; phone: string }

export default function SMSCampaignsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d.filter((c: Contact) => c.phone) : []))
  }, [])

  function toggle(id: string) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }

  const numbers = selected.map(id => contacts.find(c => c.id === id)?.phone).filter(Boolean).join(',')
  const smsLink = `sms:${numbers}?body=${encodeURIComponent(message)}`

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📱 SMS Campaigns</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Send bulk SMS to your clients via your phone.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={160}
          placeholder="Hi {name}, we have a special offer just for you..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{message.length}/160</div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>Select Recipients ({selected.length})</span>
          <button onClick={() => setSelected(selected.length === contacts.length ? [] : contacts.map(c => c.id))}
            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
            {selected.length === contacts.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        {contacts.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No contacts with phone numbers found.</p> :
          contacts.map(c => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: selected.includes(c.id) ? 'rgba(124,58,237,0.1)' : 'var(--bg2)', cursor: 'pointer', marginBottom: 6 }}>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{c.phone}</span>
            </label>
          ))
        }
      </div>

      <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--muted)' }}>
        ℹ️ This opens your phone's SMS app with all numbers and the message pre-filled. You send from your own phone number.
      </div>

      <a href={smsLink}
        style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 8, background: selected.length && message ? 'var(--accent)' : '#374151', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', pointerEvents: selected.length && message ? 'auto' : 'none' }}>
        Open SMS App ({selected.length} recipients)
      </a>
    </div>
  )
}
