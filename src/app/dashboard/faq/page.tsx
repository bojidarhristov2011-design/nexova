'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function FaqPage() {
  const [serviceDesc, setServiceDesc] = usePersistedState('faq_service', '')
  const [audience, setAudience] = usePersistedState('faq_audience', '')
  const [count, setCount] = usePersistedState('faq_count', '10')
  const [output, setOutput] = usePersistedState('faq_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!serviceDesc) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/faq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceDesc, audience, count }) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>FAQ Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate ready-to-publish FAQs for your website, landing page, or social media.</p>
      </div>
      <div style={card}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Describe your service / business *</span>
          <textarea rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} placeholder="e.g. I run a social media management agency. I help small businesses grow on Instagram and TikTok. My packages start from €500/month and include content creation, posting, and engagement." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Target audience</span>
            <input style={inp} value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Small business owners, restaurant owners" />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>How many</span>
            <select style={{ ...inp, cursor: 'pointer' }} value={count} onChange={e => setCount(e.target.value)}>
              <option value="5">5 FAQs</option>
              <option value="10">10 FAQs</option>
              <option value="15">15 FAQs</option>
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={loading || !serviceDesc} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !serviceDesc ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          {loading ? 'Generating FAQs...' : `Generate ${count} FAQs`}
        </button>
      </div>
      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your FAQs</h2>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy All'}
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </div>
  )
}
