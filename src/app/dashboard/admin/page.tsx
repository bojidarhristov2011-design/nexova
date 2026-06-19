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

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const btn = (color: string, bg: string): React.CSSProperties => ({
  background: bg, color, border: `1px solid ${color}22`, borderRadius: 8,
  padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
})

function statusInfo(u: User, now: Date) {
  if (u.isAdmin) return { label: 'Admin', color: '#c4b5fd', bg: 'rgba(167,139,250,0.1)' }
  if (u.blocked) return { label: 'Blocked', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' }
  if (u.plan === 'monthly') return { label: 'Monthly', color: '#86efac', bg: 'rgba(34,197,94,0.1)' }
  if (u.plan === 'yearly') return { label: 'Yearly', color: '#93c5fd', bg: 'rgba(59,130,246,0.1)' }
  if (!u.trialEndsAt) return { label: 'No access', color: '#9ca3af', bg: 'rgba(107,114,128,0.1)' }
  const end = new Date(u.trialEndsAt)
  const msLeft = end.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / 86400000)
  if (msLeft < 0) return { label: 'Expired', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' }
  if (daysLeft <= 5) return { label: `${daysLeft}d left`, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
  return { label: `${daysLeft}d left`, color: '#86efac', bg: 'rgba(34,197,94,0.1)' }
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.status === 403) { setError('Admin only'); setLoading(false); return }
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function extendTrial(userId: string, email: string) {
    if (!window.confirm(`Give 30 more days to ${email}?`)) return
    await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, extendTrialDays: 30 }),
    })
    await load()
  }

  async function deleteUser(userId: string, email: string) {
    if (!window.confirm(`Permanently delete ${email}? This cannot be undone.`)) return
    await fetch('/api/admin/delete-user', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    await load()
  }

  async function setBlocked(userId: string, blocked: boolean) {
    await fetch('/api/admin/block', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blocked }),
    })
    await load()
  }

  const now = new Date()
  const realUsers = users.filter(u => !u.isAdmin)
  const active = realUsers.filter(u => {
    if (u.blocked) return false
    if (u.plan === 'monthly' || u.plan === 'yearly') return true
    return u.trialEndsAt && new Date(u.trialEndsAt) > now
  })
  const expiringSoon = realUsers.filter(u => {
    if (u.plan !== 'free' || u.blocked) return false
    if (!u.trialEndsAt) return false
    const d = (new Date(u.trialEndsAt).getTime() - now.getTime()) / 86400000
    return d > 0 && d <= 5
  })
  const expired = realUsers.filter(u =>
    u.plan === 'free' && !u.blocked && u.trialEndsAt && new Date(u.trialEndsAt) < now
  )

  if (error) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#fca5a5' }}>{error}</div>

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Clients</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Manage access for all Nexova users</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total clients',   value: realUsers.length,      color: '#a78bfa' },
          { label: 'Active',          value: active.length,         color: '#86efac' },
          { label: 'Expiring ≤5 days', value: expiringSoon.length,  color: '#fbbf24' },
          { label: 'Expired',         value: expired.length,        color: '#fca5a5' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Attention banner */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>⚠️ Needs attention</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {expired.map(u => (
              <span key={u.id} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem', color: '#fca5a5' }}>
                {u.name || u.email} — expired
              </span>
            ))}
            {expiringSoon.map(u => {
              const d = Math.ceil((new Date(u.trialEndsAt!).getTime() - now.getTime()) / 86400000)
              return (
                <span key={u.id} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem', color: '#fbbf24' }}>
                  {u.name || u.email} — {d}d left
                </span>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Signed up', 'Access ends', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...realUsers].sort((a, b) => {
                const order = (u: User) => {
                  if (u.blocked) return 3
                  if (u.plan === 'monthly' || u.plan === 'yearly') return 2
                  if (!u.trialEndsAt) return 4
                  const d = new Date(u.trialEndsAt).getTime() - now.getTime()
                  if (d < 0) return 0       // expired — top
                  if (d < 5 * 86400000) return 1  // expiring soon
                  return 2                  // active
                }
                return order(a) - order(b)
              }).map(u => {
                const st = statusInfo(u, now)
                const accessEnd = u.plan === 'monthly' || u.plan === 'yearly'
                  ? `${u.plan} (ongoing)` : u.trialEndsAt ? new Date(u.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.blocked ? 0.55 : 1 }}>
                    <td style={{ padding: '0.875rem 0.875rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.875rem' }}>{u.name || u.email}</div>
                      {u.name && <div style={{ color: 'var(--dim)', fontSize: '0.775rem' }}>{u.email}</div>}
                    </td>
                    <td style={{ padding: '0.875rem 0.875rem', color: 'var(--dim)', fontSize: '0.8125rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.875rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 500 }}>
                      {accessEnd}
                    </td>
                    <td style={{ padding: '0.875rem 0.875rem' }}>
                      <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33`, borderRadius: 6, padding: '3px 10px', fontSize: '0.775rem', fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 0.875rem' }}>
                      {!u.isAdmin && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => extendTrial(u.id, u.email)} style={btn('#c4b5fd', 'rgba(167,139,250,0.1)')}>+30 days</button>
                          {!u.blocked
                            ? <button onClick={() => setBlocked(u.id, true)}  style={btn('#fca5a5', 'rgba(239,68,68,0.08)')}>Block</button>
                            : <button onClick={() => setBlocked(u.id, false)} style={btn('#86efac', 'rgba(34,197,94,0.08)')}>Unblock</button>
                          }
                          <button onClick={() => deleteUser(u.id, u.email)} style={btn('#6b7280', 'rgba(107,114,128,0.08)')}>Delete</button>
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
