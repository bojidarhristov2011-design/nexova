'use client'

import { useState, useEffect } from 'react'

interface Contact { id: string; name: string; email: string; loyaltyPoints: number }

export default function ReferralProgramPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [referrerId, setReferrerId] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/referral').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
  }, [])

  async function submit() {
    if (!referrerId || !newName) return
    setSubmitting(true)
    await fetch('/api/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referrerId, newClientName: newName, newClientEmail: newEmail }) })
    setSuccess(true)
    setReferrerId(''); setNewName(''); setNewEmail('')
    setSubmitting(false)
    fetch('/api/referral').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🤝 Referral Program</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>When a client refers someone new, they earn 50 loyalty points automatically.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Register a Referral</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Who referred? (existing client)</label>
            <select value={referrerId} onChange={e => setReferrerId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14 }}>
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.loyaltyPoints} pts</option>)}
            </select>
          </div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New client name *"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New client email (optional)"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          {success && <p style={{ color: '#4ade80', fontWeight: 600 }}>✓ Referral registered! +50 points added to referrer.</p>}
          <button onClick={submit} disabled={submitting || !referrerId || !newName}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            {submitting ? 'Registering...' : 'Register Referral (+50 pts)'}
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Referrers</h2>
        {contacts.filter(c => c.loyaltyPoints > 0).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 10).map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#f59e0b' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
            <div style={{ flex: 1, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontWeight: 700 }}>{c.loyaltyPoints} pts</div>
          </div>
        ))}
        {contacts.filter(c => c.loyaltyPoints > 0).length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>No referrals yet.</p>}
      </div>
    </div>
  )
}
