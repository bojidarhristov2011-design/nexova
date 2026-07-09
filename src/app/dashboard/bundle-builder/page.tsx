'use client'

import { useState, useEffect } from 'react'

interface Bundle { id: string; name: string; description: string; services: string; price: number }

export default function BundleBuilderPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [form, setForm] = useState({ name: '', description: '', price: '', services: ['', ''] })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/bundles').then(r => r.json()).then(d => setBundles(Array.isArray(d) ? d : []))
  }, [])

  async function create() {
    if (!form.name || !form.price) return
    setCreating(true)
    const res = await fetch('/api/bundles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, description: form.description, services: form.services.filter(Boolean), price: parseFloat(form.price) }) })
    const bundle = await res.json()
    setBundles(b => [bundle, ...b])
    setForm({ name: '', description: '', price: '', services: ['', ''] })
    setCreating(false)
  }

  async function remove(id: string) {
    await fetch('/api/bundles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setBundles(b => b.filter(x => x.id !== id))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📦 Package & Bundle Builder</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Create service bundles to sell at a discounted package price.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create Bundle</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bundle name e.g. Summer Glow Package" style={inp} />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" style={inp} />
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="Bundle price (€)" style={inp} />
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Services included</label>
            {form.services.map((s, i) => (
              <input key={i} value={s} onChange={e => { const ss = [...form.services]; ss[i] = e.target.value; setForm(f => ({ ...f, services: ss })) }}
                placeholder={`Service ${i + 1}`} style={{ ...inp, marginBottom: 6 }} />
            ))}
            <button onClick={() => setForm(f => ({ ...f, services: [...f.services, ''] }))
            } style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Add service</button>
          </div>
          <button onClick={create} disabled={creating}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            {creating ? 'Creating...' : 'Create Bundle'}
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Bundles ({bundles.length})</h2>
        {bundles.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No bundles yet.</p> :
          bundles.map(b => {
            const services = JSON.parse(b.services || '[]')
            return (
              <div key={b.id} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{b.name}</div>
                    {b.description && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{b.description}</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {services.map((s: string, i: number) => <span key={i} style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>€{b.price}</span>
                    <button onClick={() => remove(b.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
