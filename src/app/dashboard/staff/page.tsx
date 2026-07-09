'use client'

import { useState, useEffect } from 'react'

interface StaffMember { id: string; name: string; role: string; email: string | null; phone: string | null }

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(d => setStaff(Array.isArray(d) ? d : []))
  }, [])

  async function add() {
    if (!form.name) return
    setAdding(true)
    const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const member = await res.json()
    setStaff(s => [...s, member])
    setForm({ name: '', role: '', email: '', phone: '' })
    setAdding(false)
  }

  async function remove(id: string) {
    await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setStaff(s => s.filter(m => m.id !== id))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>👥 Staff Management</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Manage your team members and their roles.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Team Member</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sofia Ivanova" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Role</label>
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Laser technician" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Email</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sofia@salon.com" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+359 88 000 0000" style={inp} />
          </div>
        </div>
        <button onClick={add} disabled={adding}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {adding ? 'Adding...' : 'Add Member'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Team ({staff.length})</h2>
        {staff.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No team members yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {staff.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                  {m.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.role} {m.email ? `· ${m.email}` : ''} {m.phone ? `· ${m.phone}` : ''}</div>
                </div>
                <button onClick={() => remove(m.id)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
