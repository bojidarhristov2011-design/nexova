'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

interface Contact { id: string; name: string; email?: string | null; phone?: string | null; notes?: string | null; createdAt: string }

export default function LeadCapturePage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  const [leads, setLeads] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(data => {
      setLeads(Array.isArray(data) ? data.filter((c: Contact & { status: string }) => c.notes?.includes('Captured from public lead form') || c.notes?.includes('From website form')) : [])
      setLoading(false)
    })
  }, [])

  const link = session?.user?.id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/lead/${session.user.id}` : ''

  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Lead Capture</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Share this link anywhere — Instagram bio, Google Maps, business cards — and every submission lands in your CRM automatically.</p>
      </div>

      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.875rem' }}>Your lead capture link</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={link} style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.85rem', fontFamily: 'monospace' }} />
          <button onClick={copy} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg, var(--accent), var(--accent2))', color: copied ? '#86efac' : '#fff', border: copied ? '1px solid rgba(34,197,94,0.2)' : 'none', borderRadius: 10, padding: '0 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        </div>
        <p style={{ color: 'var(--dim)', fontSize: '0.78rem', margin: '0.75rem 0 0' }}>
          The page shows your business name and description from <a href="/dashboard/settings" style={{ color: '#a78bfa' }}>Settings</a> — update those to customize it.
        </p>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.875rem' }}>Leads captured from this link</h2>
        {loading ? (
          <p style={{ color: 'var(--dim)', fontSize: '0.875rem' }}>Loading...</p>
        ) : leads.length === 0 ? (
          <p style={{ color: 'var(--dim)', fontSize: '0.875rem' }}>No submissions yet. Share your link to start collecting leads.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            {leads.map(l => (
              <div key={l.id} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{l.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{[l.email, l.phone].filter(Boolean).join(' · ')}</div>
                {l.notes && <div style={{ color: 'var(--dim)', fontSize: '0.78rem', marginTop: 2 }}>{l.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
