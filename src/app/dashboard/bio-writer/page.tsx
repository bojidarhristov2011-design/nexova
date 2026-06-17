'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function BioWriterPage() {
  const [form, setForm] = usePersistedState('bio_form', { businessName: '', businessType: '', services: '', audience: '', tone: 'professional and approachable', founded: '' })
  const [output, setOutput] = usePersistedState('bio_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.businessType || !form.services) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/bio-writer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Business Bio Writer</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Get 3 versions — short bio for social media, medium for website header, and a full About Us page.</p>
      </div>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div><span style={lbl}>Business Name</span><input style={inp} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Leave blank to use from Settings" /></div>
          <div><span style={lbl}>Founded (optional)</span><input style={inp} value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 2021" /></div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <span style={lbl}>Business Type *</span>
          <input style={inp} value={form.businessType} onChange={e => set('businessType', e.target.value)} placeholder="e.g. Digital marketing agency, Freelance web designer, Restaurant chain" />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <span style={lbl}>Services / What You Do *</span>
          <textarea rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={form.services} onChange={e => set('services', e.target.value)} placeholder="e.g. Social media management, paid ads, email marketing, brand strategy" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div><span style={lbl}>Target Audience</span><input style={inp} value={form.audience} onChange={e => set('audience', e.target.value)} placeholder="e.g. Small businesses, e-commerce brands" /></div>
          <div><span style={lbl}>Tone</span>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.tone} onChange={e => set('tone', e.target.value)}>
              <option value="professional and approachable">Professional & Approachable</option>
              <option value="bold and confident">Bold & Confident</option>
              <option value="friendly and casual">Friendly & Casual</option>
              <option value="luxurious and premium">Luxurious & Premium</option>
              <option value="fun and energetic">Fun & Energetic</option>
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={loading || !form.businessType || !form.services} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !form.businessType || !form.services ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          {loading ? 'Writing your bios...' : '✍️ Generate Business Bios'}
        </button>
      </div>
      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Business Bios</h2>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy All'}
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </div>
  )
}
