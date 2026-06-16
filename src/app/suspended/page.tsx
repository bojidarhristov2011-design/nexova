import Link from 'next/link'
import { NexovaLogo } from '@/components/NexovaLogo'

export default function SuspendedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#09090f', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
        <NexovaLogo size={28} />
        <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nexova
        </span>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 480 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.03em' }}>Account suspended</h1>
        <p style={{ color: '#64748b', lineHeight: 1.75, margin: '0 0 2rem', fontSize: '0.95rem' }}>
          Your account has been suspended due to a missed payment. To restore access, please send payment via Revolut or bank transfer and contact us.
        </p>
        <a
          href="mailto:bojidarhristov2011@gmail.com?subject=Nexova - Restore my account&body=Hi, I would like to restore access to my Nexova account and arrange payment."
          style={{ display: 'block', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
        >
          Contact to restore access
        </a>
        <Link href="/login" style={{ color: '#334155', fontSize: '0.8rem', textDecoration: 'none' }}>
          ← Sign in with a different account
        </Link>
      </div>
    </div>
  )
}
