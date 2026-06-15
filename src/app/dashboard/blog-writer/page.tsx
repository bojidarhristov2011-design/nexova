'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

const TONES = ['professional', 'casual', 'educational', 'storytelling']

export default function BlogWriterPage() {
  const [form, setForm] = usePersistedState('blog_form', { topic: '', keywords: '', audience: '', tone: 'professional' })
  const [output, setOutput] = usePersistedState('blog_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function generate() {
    if (!form.topic) return
    setLoading(true)
    setOutput('')
    const res = await fetch('/api/blog-writer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error generating article.')
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Blog & SEO Writer</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Generate full blog posts optimised for search engines. Publish more, rank higher.</p>
      </div>

      <div style={card}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={lbl}>Blog topic *</span>
          <input style={inp} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. How to automate customer support with AI" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={lbl}>SEO Keywords (optional)</span>
            <input style={inp} value={form.keywords} onChange={e => set('keywords', e.target.value)} placeholder="e.g. AI customer support, chatbot" />
          </div>
          <div>
            <span style={lbl}>Target Audience (optional)</span>
            <input style={inp} value={form.audience} onChange={e => set('audience', e.target.value)} placeholder="e.g. Small business owners" />
          </div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>Writing Tone</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => set('tone', t)}
                style={{ background: form.tone === t ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${form.tone === t ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, color: form.tone === t ? '#c4b5fd' : 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.topic}
          style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !form.topic) ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}
        >
          {loading ? 'Writing article...' : 'Generate Blog Post'}
        </button>
      </div>

      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Your Article</h2>
            <button onClick={copy} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </div>
  )
}
