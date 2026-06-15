'use client'

import { useState, useEffect, useCallback } from 'react'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  items: string
  subtotal: number
  tax: number
  total: number
  currency: string
  status: string
  dueDate?: string | null
  notes?: string | null
  createdAt: string
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BGN', 'AED', 'CAD', 'AUD']

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '1.5rem',
}

const input: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: 10,
  padding: '0.625rem 0.875rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
}

const label: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--muted)',
  marginBottom: 4,
  display: 'block',
}

const primaryBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '0.625rem 1.25rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
  transition: 'opacity 0.15s',
}

const ghostBtn: React.CSSProperties = {
  background: 'var(--bg2)',
  color: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '0.5rem 0.875rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

function statusStyle(status: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    draft: { background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.25)' },
    sent: { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' },
    paid: { background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' },
  }
  return { ...map[status] || map.draft, borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function emptyItem(): InvoiceItem { return { description: '', quantity: 1, unitPrice: 0 } }

export default function InvoicesPage() {
  const [view, setView] = useState<'list' | 'new'>('list')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // form state
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()])
  const [taxPct, setTaxPct] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/invoices')
    const data = await res.json()
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxAmt = subtotal * (taxPct / 100)
  const total = subtotal + taxAmt

  function updateItem(idx: number, field: keyof InvoiceItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function createInvoice() {
    if (!clientName || !clientEmail || items.every(i => !i.description)) {
      setError('Fill in client name, email, and at least one item.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName, clientEmail,
          items: items.filter(i => i.description),
          tax: taxPct, currency,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setView('list')
      setClientName(''); setClientEmail(''); setItems([emptyItem()]); setTaxPct(0); setDueDate(''); setNotes('')
      await load()
    } catch {
      setError('Failed to create invoice.')
    } finally {
      setSaving(false)
    }
  }

  async function sendInvoice(id: string) {
    setSending(id)
    setError('')
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(id)
      setTimeout(() => setSent(null), 3000)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    } finally {
      setSending(null)
    }
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    })
    await load()
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    await load()
  }

  if (view === 'new') return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setView('list')} style={{ ...ghostBtn }}>← Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
          New Invoice
        </h1>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Client */}
        <div style={card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Client</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span style={label}>Name</span>
              <input style={input} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <span style={label}>Email</span>
              <input style={input} type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="john@company.com" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Line Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px auto', gap: '0.625rem', alignItems: 'center' }}>
                <input
                  style={input}
                  value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)}
                  placeholder="Service description"
                />
                <input
                  style={{ ...input, textAlign: 'center' }}
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                />
                <input
                  style={{ ...input, textAlign: 'right' }}
                  type="number" min="0" step="0.01"
                  value={item.unitPrice}
                  onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                  placeholder="0.00"
                />
                <button
                  onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                  style={{ ...ghostBtn, padding: '0.5rem 0.625rem', color: 'var(--dim)' }}
                >✕</button>
              </div>
            ))}
            <button onClick={() => setItems(prev => [...prev, emptyItem()])} style={{ ...ghostBtn, alignSelf: 'flex-start', marginTop: 4 }}>
              + Add item
            </button>
          </div>
        </div>

        {/* Totals & Settings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={label}>Currency</span>
                <select style={{ ...input }} value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <span style={label}>Tax %</span>
                <input style={input} type="number" min="0" max="100" value={taxPct} onChange={e => setTaxPct(Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <span style={label}>Due Date (optional)</span>
                <input style={input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Total</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.9rem' }}>
                <span>Subtotal</span><span>{fmt(subtotal, currency)}</span>
              </div>
              {taxPct > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  <span>Tax ({taxPct}%)</span><span>{fmt(taxAmt, currency)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span>Total</span><span>{fmt(total, currency)}</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span style={label}>Notes (optional)</span>
              <textarea
                style={{ ...input, resize: 'vertical' }}
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Payment instructions, bank details..."
              />
            </div>
          </div>
        </div>

        <button onClick={createInvoice} disabled={saving} style={{ ...primaryBtn, alignSelf: 'flex-end', padding: '0.75rem 2rem', opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
            Invoices
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
            Create and send professional invoices by email in seconds
          </p>
        </div>
        <button onClick={() => { setError(''); setView('new') }} style={primaryBtn}>
          + New Invoice
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : invoices.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧾</p>
          <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>No invoices yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create your first invoice and send it to a client by email.</p>
          <button onClick={() => setView('new')} style={primaryBtn}>Create Invoice</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{inv.invoiceNumber}</span>
                  <span style={statusStyle(inv.status)}>{inv.status}</span>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{inv.clientName} · {inv.clientEmail}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 100 }}>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(inv.total, inv.currency)}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {inv.status !== 'paid' && (
                  <button
                    onClick={() => sendInvoice(inv.id)}
                    disabled={sending === inv.id}
                    style={{ ...ghostBtn, background: sent === inv.id ? 'rgba(34,197,94,0.15)' : undefined, color: sent === inv.id ? '#86efac' : undefined }}
                  >
                    {sending === inv.id ? '...' : sent === inv.id ? '✓ Sent' : '✉ Send'}
                  </button>
                )}
                {inv.status === 'sent' && (
                  <button onClick={() => markPaid(inv.id)} style={{ ...ghostBtn, color: '#86efac' }}>
                    ✓ Mark Paid
                  </button>
                )}
                <button onClick={() => deleteInvoice(inv.id)} style={{ ...ghostBtn, color: '#fca5a5' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
