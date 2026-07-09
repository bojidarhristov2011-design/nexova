'use client'

import { useState, useEffect } from 'react'

interface Entry { id: string; name: string; email: string | null; phone: string | null; service: string; status: string; createdAt: string }

export default function WaitlistPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setEntries(Array.isArray(d) ? d : []))
  }, [])

  async function add() {
    if (!form.name) return
    setAdding(true)
    const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const entry = await res.json()
    setEntries(e => [...e, entry])
    setForm({ name: '', email: '', phone: '', service: '' })
    setAdding(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/waitlist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setEntries(e => e.map(x => x.id === id ? { ...x, status } : x))
  }

  async function remove(id: string) {
    await fetch('/api/waitlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setEntries(e => e.filter(x => x.id !== id))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }
  const waiting = entries.filter(e => e.status === 'waiting')
  const booked = entries.filter(e => e.status === 'booked')

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>⏳ Waitlist Manager</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Manage clients waiting for a slot.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{waiting.length}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Waiting</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{booked.length}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Booked</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add to Waitlist</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" style={inp} />
          <input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="Service" style={inp} />
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" style={inp} />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" style={inp} />
        </div>
        <button onClick={add} disabled={adding || !form.name}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {adding ? 'Adding...' : 'Add to Waitlist'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Waitlist ({entries.length})</h2>
        {entries.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No one on the waitlist yet.</p> :
          entries.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{e.name} {e.service && <span style={{ fontSize: 12, color: 'var(--muted)' }}>— {e.service}</span>}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.email} {e.phone}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: e.status === 'waiting' ? 'rgba(251,191,36,0.15)' : 'rgba(34,197,94,0.15)', color: e.status === 'waiting' ? '#fbbf24' : '#22c55e' }}>{e.status}</span>
              {e.status === 'waiting' && <button onClick={() => updateStatus(e.id, 'booked')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Book</button>}
              <button onClick={() => remove(e.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
