'use client'

import { useState, useEffect, useCallback } from 'react'

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const ghostBtn: React.CSSProperties = { background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '0.4rem 0.625rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit' }

interface Invoice {
  id: string; invoiceNumber: string; clientName: string; clientEmail: string
  total: number; currency: string; status: string; dueDate: string | null
}
interface Lead { id: string; name: string; email?: string | null; status: string }

export default function SalesAutomationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [reminderFor, setReminderFor] = useState<Invoice | null>(null)
  const [reminderText, setReminderText] = useState('')
  const [reminderLoading, setReminderLoading] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduled, setScheduled] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const [invRes, conRes] = await Promise.all([fetch('/api/invoices'), fetch('/api/contacts')])
    const invData = await invRes.json()
    const conData = await conRes.json()
    setInvoices(Array.isArray(invData) ? invData : [])
    setLeads(Array.isArray(conData) ? conData.filter((c: Lead) => c.status === 'lead') : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const now = new Date()
  const overdue = invoices.filter(i => i.status === 'sent' && i.dueDate && new Date(i.dueDate) < now)

  async function openReminder(inv: Invoice) {
    setReminderFor(inv); setReminderText(''); setReminderLoading(true)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    setScheduleDate(tomorrow.toISOString().split('T')[0])
    try {
      const res = await fetch('/api/payment-reminder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id }),
      })
      const data = await res.json()
      setReminderText(data.content || '')
    } finally { setReminderLoading(false) }
  }

  async function scheduleReminder() {
    if (!reminderFor || !reminderText || !scheduleDate) return
    const scheduledAt = new Date(scheduleDate); scheduledAt.setHours(9, 0, 0, 0)
    await fetch('/api/scheduled-emails', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: reminderFor.clientEmail, subject: `Payment reminder — Invoice ${reminderFor.invoiceNumber}`, body: reminderText, scheduledAt: scheduledAt.toISOString(), label: `Payment reminder — ${reminderFor.invoiceNumber}` }),
    })
    setScheduled(prev => [...prev, reminderFor.id])
    setReminderFor(null)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Sales Automation</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Automated follow-ups for overdue invoices and unconverted leads — generate once, schedule, done.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center' as const, padding: '3rem' }}>Loading...</p>
      ) : (
        <>
          <div style={{ ...card, marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.25rem' }}>💰 Overdue Invoices</h2>
            <p style={{ color: 'var(--dim)', fontSize: '0.8rem', margin: '0 0 1rem' }}>Invoices sent but unpaid past their due date</p>
            {overdue.length === 0 ? (
              <p style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>Nothing overdue right now. 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {overdue.map(inv => {
                  const days = inv.dueDate ? Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000) : 0
                  return (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{inv.clientName} — {inv.invoiceNumber}</div>
                        <div style={{ color: '#fca5a5', fontSize: '0.78rem' }}>{inv.total} {inv.currency} · {days}d overdue</div>
                      </div>
                      <button onClick={() => openReminder(inv)} disabled={scheduled.includes(inv.id)}
                        style={{ ...ghostBtn, color: scheduled.includes(inv.id) ? '#86efac' : '#fbbf24' }}>
                        {scheduled.includes(inv.id) ? '✓ Reminder scheduled' : '✉ Send Reminder'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.25rem' }}>🎯 Unconverted Leads</h2>
            <p style={{ color: 'var(--dim)', fontSize: '0.8rem', margin: '0 0 1rem' }}>Leads sitting without a follow-up sequence — nurture them from the CRM</p>
            {leads.length === 0 ? (
              <p style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>No open leads right now.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                {leads.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{l.name}</div>
                      <div style={{ color: 'var(--dim)', fontSize: '0.78rem' }}>{l.email || 'No email on file'}</div>
                    </div>
                    <a href="/dashboard/crm" style={{ ...ghostBtn, color: '#c4b5fd', textDecoration: 'none' }}>✨ Nurture in CRM</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Reminder modal */}
      {reminderFor && (
        <div onClick={() => setReminderFor(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ ...card, maxWidth: 480, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Reminder for {reminderFor.clientName}</h2>
              <button onClick={() => setReminderFor(null)} style={ghostBtn}>✕</button>
            </div>
            {reminderLoading ? (
              <p style={{ color: 'var(--dim)', textAlign: 'center' as const, padding: '2rem' }}>Writing reminder...</p>
            ) : (
              <>
                <textarea value={reminderText} onChange={e => setReminderText(e.target.value)} rows={6}
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.85rem', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.6, marginBottom: '0.875rem' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ ...inp, flex: 1 }} />
                  <button onClick={scheduleReminder} disabled={!reminderText || !scheduleDate}
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !reminderText || !scheduleDate ? 0.5 : 1 }}>
                    🗓 Schedule
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
