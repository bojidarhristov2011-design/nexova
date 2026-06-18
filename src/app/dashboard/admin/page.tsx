'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name?: string | null
  plan: string
  isAdmin: boolean
  blocked: boolean
  planStarted?: string | null
  trialEndsAt?: string | null
  createdAt: string
  _count: { agents: number; invoices: number; contacts: number }
}

const planStyle = (p: string): React.CSSProperties => ({
  monthly: { background: 'rgba(34,197,94,0.12)',  color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' },
  yearly:  { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' },
  free:    { background: 'rgba(107,114,128,0.12)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.25)' },
}[p] ?? {}, { borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 })

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const ghostBtn: React.CSSProperties = { background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notifying, setNotifying] = useState(false)
  const [notifyResult, setNotifyResult] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.status === 403) { setError('Access denied — admin only'); setLoading(false); return }
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function setPlan(userId: string, plan: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    })
    await load()
  }

  async function setBlocked(userId: string, blocked: boolean) {
    await fetch('/api/admin/block', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blocked }),
    })
    await load()
  }

  async function sendInvoice(userId: string) {
    const res = await fetch('/api/admin/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.success) alert(`Invoice ${data.invoiceNumber} sent!`)
    else alert('Failed to send invoice')
  }

  async function extendTrial(userId: string, days: number) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, extendTrialDays: days }),
    })
    await load()
  }

  async function notifyTrials() {
    setNotifying(true); setNotifyResult('')
    const res = await fetch('/api/admin/notify-trials', { method: 'POST' })
    const data = await res.json()
    setNotifyResult(data.sent > 0 ? `Email sent — ${data.sent} user(s) overdue` : 'No overdue users right now')
    setNotifying(false)
  }

  const now = new Date()
  const paying = users.filter(u => u.plan !== 'free' && !u.isAdmin)
  const free = users.filter(u => u.plan === 'free' && !u.isAdmin)
  const revenue = paying.filter(u => u.plan === 'monthly').length * 20 + paying.filter(u => u.plan === 'yearly').length * 200

  // Users whose trial ended, not paying, not blocked
  const overdue = users.filter(u =>
    !u.isAdmin && u.plan === 'free' && !u.blocked &&
    u.trialEndsAt && new Date(u.trialEndsAt) < now
  )

  if (error) return (
    <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
      <p style={{ color: '#fca5a5', fontSize: '1.125rem' }}>{error}</p>
    </div>
  )

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Admin Panel</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>All users on Nexova</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {notifyResult && <span style={{ fontSize: '0.8rem', color: '#86efac' }}>{notifyResult}</span>}
          <button onClick={notifyTrials} disabled={notifying} style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {notifying ? 'Sending...' : '🔔 Send Trial Reminders'}
          </button>
        </div>
      </div>

      {/* Action needed banner */}
      {overdue.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '1.125rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.9rem' }}>⚠️ {overdue.length} user{overdue.length > 1 ? 's' : ''} with expired trial — no payment yet</span>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>
              {overdue.map(u => {
                const days = Math.floor((now.getTime() - new Date(u.trialEndsAt!).getTime()) / 86400000)
                return <span key={u.id} style={{ marginRight: 12 }}>{u.email} <span style={{ color: days >= 1 ? '#ef4444' : '#f59e0b' }}>({days === 0 ? 'today' : `${days}d overdue`})</span></span>
              })}
            </div>
          </div>
          <button onClick={notifyTrials} disabled={notifying} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {notifying ? 'Sending...' : '📧 Email me now'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users',    value: users.filter(u => !u.isAdmin).length, color: '#a78bfa' },
          { label: 'Paying Clients', value: paying.length,                        color: '#34d399' },
          { label: 'Free Users',     value: free.length,                          color: '#9ca3af' },
          { label: 'Est. Revenue',   value: `€${revenue.toFixed(0)}`,             color: '#f472b6' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Joined', 'Trial ends', 'Plan', 'Usage', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const trialEnd = u.trialEndsAt ? new Date(u.trialEndsAt) : null
                const trialExpired = trialEnd && trialEnd < now
                const daysOver = trialExpired ? Math.floor((now.getTime() - trialEnd.getTime()) / 86400000) : 0
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.blocked ? 0.5 : 1 }}>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.875rem' }}>{u.name || u.email}</div>
                      {u.name && <div style={{ color: 'var(--dim)', fontSize: '0.775rem' }}>{u.email}</div>}
                      {u.isAdmin && <span style={{ fontSize: '0.7rem', background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', borderRadius: 4, padding: '1px 5px', marginTop: 2, display: 'inline-block' }}>admin</span>}
                      {u.blocked && <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: 4, padding: '1px 5px', marginTop: 2, display: 'inline-block' }}>blocked</span>}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--dim)', fontSize: '0.8125rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.8rem' }}>
                      {trialEnd ? (
                        <span style={{ color: trialExpired ? (daysOver >= 1 ? '#ef4444' : '#f59e0b') : '#86efac' }}>
                          {trialExpired ? (daysOver === 0 ? 'Today' : `${daysOver}d ago`) : trialEnd.toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      <span style={planStyle(u.plan)}>{u.plan}</span>
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem', color: 'var(--dim)', fontSize: '0.8rem' }}>
                      🤖 {u._count.agents} · 🧾 {u._count.invoices} · 👥 {u._count.contacts}
                    </td>
                    <td style={{ padding: '0.875rem 0.75rem' }}>
                      {!u.isAdmin && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {u.plan !== 'monthly' && <button onClick={() => setPlan(u.id, 'monthly')} style={{ ...ghostBtn, color: '#86efac' }}>Monthly</button>}
                          {u.plan !== 'yearly'  && <button onClick={() => setPlan(u.id, 'yearly')}  style={{ ...ghostBtn, color: '#93c5fd' }}>Yearly</button>}
                          {u.plan !== 'free'    && <button onClick={() => setPlan(u.id, 'free')}    style={{ ...ghostBtn, color: '#fca5a5' }}>Revoke</button>}
                          {u.plan !== 'free'    && <button onClick={() => sendInvoice(u.id)}         style={{ ...ghostBtn, color: '#fbbf24' }}>Invoice</button>}
                          <button onClick={() => extendTrial(u.id, 30)} style={{ ...ghostBtn, color: '#c4b5fd', borderColor: 'rgba(167,139,250,0.3)' }}>+30d Trial</button>
                          {!u.blocked
                            ? <button onClick={() => setBlocked(u.id, true)}  style={{ ...ghostBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Block</button>
                            : <button onClick={() => setBlocked(u.id, false)} style={{ ...ghostBtn, color: '#86efac', borderColor: 'rgba(34,197,94,0.3)' }}>Unblock</button>
                          }
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
