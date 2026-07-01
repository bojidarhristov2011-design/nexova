'use client'

import { useState, useEffect, useRef } from 'react'

interface Grant { ownerId: string; ownerName: string | null; ownerEmail: string }

export function WorkspaceSwitcher({ actingAs, currentName }: { actingAs: boolean; currentName?: string | null }) {
  const [grants, setGrants] = useState<Grant[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (actingAs) return
    fetch('/api/team-access/granted-to-me').then(r => r.json()).then(d => setGrants(Array.isArray(d) ? d : []))
  }, [actingAs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function switchTo(ownerId: string) {
    await fetch('/api/team-access/switch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: ownerId }),
    })
    window.location.href = '/dashboard'
  }

  async function switchBack() {
    await fetch('/api/team-access/switch', { method: 'DELETE' })
    window.location.href = '/dashboard'
  }

  if (actingAs) {
    return (
      <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '0.625rem 0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>⚡ Acting as {currentName || 'client'}</div>
        <button onClick={switchBack} style={{ background: 'none', border: 'none', color: '#fbbf24', textDecoration: 'underline', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          ← Switch back to my account
        </button>
      </div>
    )
  }

  if (grants.length === 0) return null

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: '0.5rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4375rem 0.75rem', borderRadius: 8, fontSize: '0.875rem', color: open ? '#c4b5fd' : 'var(--muted)', background: open ? 'rgba(124,58,237,0.12)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: '0.9375rem', width: 18, textAlign: 'center', flexShrink: 0 }}>🔀</span>
        <span style={{ flex: 1 }}>Switch account ({grants.length})</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: '110%', left: 0, right: 0, background: '#13132a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.375rem', zIndex: 999, maxHeight: 240, overflowY: 'auto' as const, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
          {grants.map(g => (
            <button key={g.ownerId} onClick={() => switchTo(g.ownerId)}
              style={{ display: 'block', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 7, background: 'transparent', color: 'var(--muted)', border: 'none', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit', fontSize: '0.82rem' }}>
              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{g.ownerName || g.ownerEmail}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.6 }}>{g.ownerEmail}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
