'use client'

import { useEffect, useState } from 'react'
import { NexovaLogo } from './NexovaLogo'

export function MobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile && !dismissed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#06060f', color: '#eeeeff',
        fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <NexovaLogo size={28} />
          <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nexova
          </span>
        </div>

        <div style={{ background: '#10101e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 380 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>🖥️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.875rem', letterSpacing: '-0.03em' }}>
            Best on desktop
          </h1>
          <p style={{ color: '#8888aa', lineHeight: 1.8, margin: '0 0 1.75rem', fontSize: '0.9rem' }}>
            Nexova is designed for desktop and laptop computers. Open it on your computer for the full experience.
          </p>
          <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#a78bfa', lineHeight: 1.6 }}>
            📋 Copy this link and open it on your computer:<br />
            <strong style={{ color: '#c4b5fd', wordBreak: 'break-all' }}>nexova-platform.netlify.app</strong>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#4a4a6a', borderRadius: 10, padding: '0.625rem 1.25rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Continue anyway
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
