'use client'

import { useState, useEffect } from 'react'

interface GiftCard { id: string; code: string; amount: number; recipient: string; used: boolean; createdAt: string }

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [creating, setCreating] = useState(false)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    fetch('/api/gift-cards').then(r => r.json()).then(d => setCards(Array.isArray(d) ? d : []))
    fetch('/api/settings').then(r => r.json()).then(d => setBusinessName(d.businessName || 'Your Business'))
  }, [])

  async function create() {
    if (!amount) return
    setCreating(true)
    const res = await fetch('/api/gift-cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: parseFloat(amount), recipient }) })
    const card = await res.json()
    setCards(c => [card, ...c])
    setAmount('')
    setRecipient('')
    setCreating(false)
  }

  async function markUsed(id: string, used: boolean) {
    await fetch('/api/gift-cards', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, used }) })
    setCards(c => c.map(x => x.id === id ? { ...x, used } : x))
  }

  async function remove(id: string) {
    await fetch('/api/gift-cards', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setCards(c => c.filter(x => x.id !== id))
  }

  function print(card: GiftCard) {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f0f1a;color:#fff">
      <div style="border:2px solid #6366f1;border-radius:16px;padding:40px;max-width:400px;margin:0 auto">
        <h1 style="color:#a78bfa;margin-bottom:8px">${businessName}</h1>
        <p style="color:#8888aa;margin-bottom:24px">Gift Card</p>
        <div style="font-size:48px;font-weight:700;color:#fff;margin-bottom:16px">€${card.amount}</div>
        <div style="background:#1a1a2e;border-radius:8px;padding:12px;font-family:monospace;font-size:20px;letter-spacing:4px;color:#c4b5fd;margin-bottom:16px">${card.code}</div>
        ${card.recipient ? `<p style="color:#8888aa">For: ${card.recipient}</p>` : ''}
      </div>
    </body></html>`)
    w.print()
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🎁 Gift Card Generator</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Create and manage gift cards for your business.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create Gift Card</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Amount (€) *</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="50"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Recipient (optional)</label>
            <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Maria"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>
        <button onClick={create} disabled={creating || !amount}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {creating ? 'Creating...' : 'Generate Gift Card'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Gift Cards ({cards.length})</h2>
        {cards.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No gift cards yet.</p> :
          cards.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 8, opacity: c.used ? 0.5 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>€{c.amount}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>{c.code}</span>
                  {c.used && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>USED</span>}
                </div>
                {c.recipient && <div style={{ fontSize: 12, color: 'var(--muted)' }}>For: {c.recipient}</div>}
              </div>
              <button onClick={() => print(c)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>Print</button>
              <button onClick={() => markUsed(c.id, !c.used)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: c.used ? '#374151' : '#22c55e', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{c.used ? 'Restore' : 'Mark Used'}</button>
              <button onClick={() => remove(c.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
