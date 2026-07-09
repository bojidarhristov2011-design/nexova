'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; email: string; birthday: string | null }

export default function BirthdayMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [birthday, setBirthday] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
  }, [])

  async function saveBirthday(id: string) {
    setSaving(true)
    await fetch(`/api/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ birthday }) })
    setContacts(cs => cs.map(c => c.id === id ? { ...c, birthday } : c))
    setEditing(null)
    setBirthday('')
    setSaving(false)
  }

  const today = new Date()
  const upcoming = contacts.filter(c => {
    if (!c.birthday) return false
    const bday = new Date(c.birthday)
    const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
    const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  })

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🎂 Birthday Messages</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Track client birthdays and send automatic birthday messages.</p>

      {upcoming.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎉 Upcoming Birthdays (next 30 days)</h2>
          {upcoming.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 10 }}>{c.birthday}</span>
              </div>
              {c.email && (
                <a href={`mailto:${c.email}?subject=Happy Birthday ${c.name}!&body=Hi ${c.name},%0A%0AWishing you a wonderful birthday from all of us! 🎂%0A%0AWarm regards`}
                  style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                  Send Wishes
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Clients</h2>
        {contacts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No contacts yet. Add them in CRM first.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg2)' }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
                {editing === c.id ? (
                  <>
                    <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }} />
                    <button onClick={() => saveBirthday(c.id)} disabled={saving}
                      style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditing(null)}
                      style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: c.birthday ? 'var(--text)' : 'var(--muted)', fontSize: 13 }}>{c.birthday || 'No birthday set'}</span>
                    <button onClick={() => { setEditing(c.id); setBirthday(c.birthday || '') }}
                      style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Edit</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
