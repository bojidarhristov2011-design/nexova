'use client'

import { useState, useEffect, useCallback } from 'react'

interface Contact {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  status: string
  notes?: string | null
  createdAt: string
}

const STATUSES = ['lead', 'customer', 'lost']

const STATUS_COLORS: Record<string, React.CSSProperties> = {
  lead:     { background: 'rgba(59,130,246,0.12)',  color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' },
  customer: { background: 'rgba(34,197,94,0.12)',   color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' },
  lost:     { background: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.25)' },
}
const statusStyle = (s: string): React.CSSProperties => ({ ...(STATUS_COLORS[s] ?? {}), borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 })

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 4, display: 'block' }
const primaryBtn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const ghostBtn: React.CSSProperties = { background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }

function emptyForm() { return { name: '', email: '', phone: '', company: '', status: 'lead', notes: '' } }

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/contacts')
    const data = await res.json()
    setContacts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setForm(emptyForm()); setEditing(null); setShowForm(true) }
  function openEdit(c: Contact) {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status, notes: c.notes || '' })
    setEditing(c)
    setShowForm(true)
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts'
    const method = editing ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setShowForm(false)
    await load()
  }

  async function del(id: string) {
    if (!confirm('Delete this contact?')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    await load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await load()
  }

  const filtered = contacts.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !`${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = { all: contacts.length, lead: contacts.filter(c => c.status === 'lead').length, customer: contacts.filter(c => c.status === 'customer').length, lost: contacts.filter(c => c.status === 'lost').length }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>CRM</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Track your leads and customers in one place</p>
        </div>
        <button onClick={openNew} style={primaryBtn}>+ Add Contact</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {(['all', 'lead', 'customer', 'lost'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...ghostBtn, background: filter === f ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', color: filter === f ? '#c4b5fd' : 'var(--muted)', border: `1px solid ${filter === f ? 'rgba(124,58,237,0.3)' : 'var(--border)'}` }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} <span style={{ opacity: 0.7 }}>({counts[f]})</span>
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inp, width: 200, marginLeft: 'auto' }} />
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ ...card, marginBottom: '1.5rem', borderColor: 'rgba(124,58,237,0.3)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>
            {editing ? 'Edit Contact' : 'New Contact'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[['name', 'Name *'], ['email', 'Email'], ['phone', 'Phone'], ['company', 'Company']].map(([field, label]) => (
              <div key={field}>
                <span style={lbl}>{label}</span>
                <input style={inp} value={(form as Record<string, string>)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={label.replace(' *', '')} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span style={lbl}>Status</span>
              <select style={inp} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>Notes</span>
              <input style={inp} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={saving || !form.name} style={{ ...primaryBtn, opacity: saving || !form.name ? 0.5 : 1 }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Contact'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</p>
          <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>No contacts yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add your first lead or customer to start tracking your pipeline.</p>
          <button onClick={openNew} style={primaryBtn}>Add First Contact</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(c => (
            <div key={c.id} style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{c.name}</span>
                  <span style={statusStyle(c.status)}>{c.status}</span>
                  {c.company && <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{c.company}</span>}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>
                  {[c.email, c.phone].filter(Boolean).join(' · ')}
                  {c.notes && <span style={{ color: 'var(--dim)' }}> · {c.notes}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {c.status === 'lead' && (
                  <button onClick={() => updateStatus(c.id, 'customer')} style={{ ...ghostBtn, color: '#86efac' }}>→ Customer</button>
                )}
                <button onClick={() => openEdit(c)} style={ghostBtn}>Edit</button>
                <button onClick={() => del(c.id)} style={{ ...ghostBtn, color: '#fca5a5' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
