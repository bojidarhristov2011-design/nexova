'use client'

import { useState, useEffect } from 'react'

interface Item { id: string; name: string; quantity: number; unit: string; lowAlert: number }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', lowAlert: '5' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : []))
  }, [])

  async function add() {
    if (!form.name) return
    setAdding(true)
    const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, quantity: parseInt(form.quantity) || 0, unit: form.unit, lowAlert: parseInt(form.lowAlert) || 5 }) })
    const item = await res.json()
    setItems(i => [...i, item])
    setForm({ name: '', quantity: '', unit: '', lowAlert: '5' })
    setAdding(false)
  }

  async function updateQty(id: string, quantity: number) {
    await fetch('/api/inventory', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, quantity }) })
    setItems(i => i.map(x => x.id === id ? { ...x, quantity } : x))
  }

  async function remove(id: string) {
    await fetch('/api/inventory', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setItems(i => i.filter(x => x.id !== id))
  }

  const lowStock = items.filter(i => i.quantity <= i.lowAlert)
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📦 Inventory Tracker</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Track your products and supplies.</p>

      {lowStock.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: 6 }}>⚠️ Low Stock Alert</div>
          {lowStock.map(i => <div key={i.id} style={{ fontSize: 13, color: '#fca5a5' }}>{i.name} — only {i.quantity} {i.unit} left</div>)}
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Item</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name *" style={inp} />
          <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} type="number" placeholder="Qty" style={inp} />
          <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unit (ml, pcs)" style={inp} />
          <input value={form.lowAlert} onChange={e => setForm(f => ({ ...f, lowAlert: e.target.value }))} type="number" placeholder="Alert at" style={inp} />
        </div>
        <button onClick={add} disabled={adding || !form.name}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {adding ? 'Adding...' : 'Add Item'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Stock ({items.length} items)</h2>
        {items.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No items yet.</p> :
          items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: item.quantity <= item.lowAlert ? 'rgba(239,68,68,0.05)' : 'var(--bg2)', marginBottom: 8, border: item.quantity <= item.lowAlert ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Alert at {item.lowAlert} {item.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 40, textAlign: 'center', color: item.quantity <= item.lowAlert ? '#fca5a5' : 'var(--text)' }}>{item.quantity} {item.unit}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
              <button onClick={() => remove(item.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
