'use client'

import { useState, useEffect } from 'react'

interface UserWithFeatures { id: string; email: string; name: string | null; features: { slug: string }[] }

const PREMIUM_FEATURES = [
  { slug: 'qr-generator',       label: 'QR Code Generator' },
  { slug: 'review-requests',    label: 'Review Request Sender' },
  { slug: 'birthday-messages',  label: 'Birthday Messages' },
  { slug: 'loyalty',            label: 'Loyalty Points' },
  { slug: 'staff',              label: 'Staff Management' },
  { slug: 'surveys',            label: 'Customer Surveys' },
  { slug: 'sms-campaigns',      label: 'SMS Campaigns' },
  { slug: 'booking-calendar',   label: 'Online Booking Calendar' },
  { slug: 'gift-cards',         label: 'Gift Card Generator' },
  { slug: 'inventory',          label: 'Inventory Tracker' },
  { slug: 'waitlist',           label: 'Waitlist Manager' },
  { slug: 'referral-program',   label: 'Referral Program' },
  { slug: 'payment-links',      label: 'Payment Links (Stripe)' },
  { slug: 'tiktok-scripts',     label: 'TikTok Script Generator' },
  { slug: 'google-my-business', label: 'Google My Business Auto-post' },
]

export default function AdminFeaturesPage() {
  const [users, setUsers] = useState<UserWithFeatures[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/features').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []))
  }, [])

  const selectedUser = users.find(u => u.id === selected)
  const userSlugs = new Set(selectedUser?.features.map(f => f.slug) || [])

  async function toggle(slug: string, enabled: boolean) {
    if (!selected) return
    setToggling(slug)
    await fetch('/api/admin/features', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selected, slug, enabled }) })
    setUsers(us => us.map(u => u.id === selected ? {
      ...u,
      features: enabled ? [...u.features, { slug }] : u.features.filter(f => f.slug !== slug),
    } : u))
    setToggling(null)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🔧 Client Feature Manager</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Enable or disable premium features per client.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Select Client</div>
          {users.map(u => (
            <button key={u.id} onClick={() => setSelected(u.id)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: selected === u.id ? 'var(--accent)' : 'transparent', color: selected === u.id ? '#fff' : 'var(--text)', cursor: 'pointer', marginBottom: 4, fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{u.name || u.email}</div>
              {u.name && <div style={{ fontSize: 11, opacity: 0.7 }}>{u.email}</div>}
              <div style={{ fontSize: 11, opacity: 0.7 }}>{u.features.length} features enabled</div>
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          {!selected ? (
            <p style={{ color: 'var(--muted)' }}>Select a client to manage their features.</p>
          ) : (
            <>
              <div style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>
                Features for {selectedUser?.name || selectedUser?.email}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PREMIUM_FEATURES.map(f => {
                  const enabled = userSlugs.has(f.slug)
                  return (
                    <div key={f.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'var(--bg2)' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>/{f.slug}</div>
                      </div>
                      <button onClick={() => toggle(f.slug, !enabled)} disabled={toggling === f.slug}
                        style={{ padding: '7px 20px', borderRadius: 20, border: 'none', background: enabled ? '#22c55e' : '#374151', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', minWidth: 70 }}>
                        {toggling === f.slug ? '...' : enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
