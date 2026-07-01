'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const inp: React.CSSProperties = { width: '100%', background: '#10101e', border: '1px solid rgba(255,255,255,0.08)', color: '#eeeeff', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', marginBottom: '0.75rem' }

export default function PublicLeadForm() {
  const params = useParams()
  const userId = params.userId as string
  const [business, setBusiness] = useState<{ businessName: string; businessDesc: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/public/lead-form/${userId}`).then(r => r.json()).then(setBusiness).catch(() => setBusiness({ businessName: 'this business', businessDesc: '' }))
  }, [userId])

  async function submit() {
    if (!form.name) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/public/lead-form/${userId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Something went wrong')
      setSubmitted(true)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060f', color: '#eeeeff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2.5rem', maxWidth: 440, width: '100%' }}>
        {submitted ? (
          <div style={{ textAlign: 'center' as const, padding: '1.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Thanks, {form.name}!</h2>
            <p style={{ color: '#8888aa', fontSize: '0.9rem', margin: 0 }}>{business?.businessName || 'We'} will be in touch soon.</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
              Get in touch with {business?.businessName || '...'}
            </h1>
            {business?.businessDesc && <p style={{ color: '#8888aa', fontSize: '0.875rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>{business.businessDesc}</p>}
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '0.6rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.85rem' }}>{error}</div>}
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name *" style={inp} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" style={inp} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" style={inp} />
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What are you looking for?" rows={3} style={{ ...inp, resize: 'vertical' as const }} />
            <button onClick={submit} disabled={!form.name || loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.85rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !form.name || loading ? 0.5 : 1 }}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
