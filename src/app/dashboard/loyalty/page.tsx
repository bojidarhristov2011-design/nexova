'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; email: string; phone: string; loyaltyPoints: number }

export default function LoyaltyPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [adding, setAdding] = useState<{ [id: string]: number }>({})

  useEffect(() => {
    fetch('/api/loyalty').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
  }, [])

  async function addPoints(id: string, pts: number) {
    const res = await fetch('/api/loyalty', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: id, points: pts }) })
    const updated = await res.json()
    setContacts(cs => cs.map(c => c.id === id ? { ...c, loyaltyPoints: updated.loyaltyPoints } : c).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints))
  }

  const totalPoints = contacts.reduce((s, c) => s + c.loyaltyPoints, 0)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🏆 Loyalty Points</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Track and manage loyalty points for your clients.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Total Points Issued</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalPoints}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Active Members</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{contacts.filter(c => c.loyaltyPoints > 0).length}</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Client Points</h2>
        {contacts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No clients yet. Add them in CRM first.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email || c.phone || ''}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, minWidth: 60, textAlign: 'right' }}>{c.loyaltyPoints} pts</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => addPoints(c.id, 10)}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+10</button>
                  <button onClick={() => addPoints(c.id, -10)}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>-10</button>
                  <input type="number" placeholder="custom" value={adding[c.id] || ''} onChange={e => setAdding(a => ({ ...a, [c.id]: Number(e.target.value) }))}
                    style={{ width: 70, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }} />
                  <button onClick={() => { addPoints(c.id, adding[c.id] || 0); setAdding(a => ({ ...a, [c.id]: 0 })) }}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
