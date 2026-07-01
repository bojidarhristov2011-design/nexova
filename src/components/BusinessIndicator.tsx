'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function BusinessIndicator() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const match = document.cookie.match(/nx_current_business=([^;]+)/)
    if (!match) { setName(null); return }
    fetch('/api/businesses').then(r => r.json()).then(list => {
      const found = Array.isArray(list) ? list.find((b: { id: string; name: string }) => b.id === match[1]) : null
      setName(found?.name || null)
    })
  }, [])

  return (
    <Link href="/dashboard/settings" style={{ display: 'block', textDecoration: 'none', margin: '0 1rem 1rem' }}>
      <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '0.4rem 0.625rem', fontSize: '0.72rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🏢</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{name || 'All businesses'}</span>
      </div>
    </Link>
  )
}
