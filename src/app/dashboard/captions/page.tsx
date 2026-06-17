'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }

export default function CaptionsPage() {
  const [platform, setPlatform] = usePersistedState('caption_platform', 'Instagram')
  const [topic, setTopic] = usePersistedState('caption_topic', '')
  const [tone, setTone] = usePersistedState('caption_tone', 'engaging and authentic')
  const [cta, setCta] = usePersistedState('caption_cta', '')
  const [result, setResult] = usePersistedState('caption_result', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  async function generate() {
    if (!topic) return
    setLoading(true)
    const res = await fetch('/api/captions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, topic, tone, cta }) })
    const data = await res.json()
    setResult(data.content || data.error || 'Error')
    setLoading(false)
  }

  const captions = result ? result.split('---').filter(s => s.trim()) : []

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Caption Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Get 3 scroll-stopping captions with hashtags for Instagram, TikTok, or LinkedIn.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Instagram', 'TikTok', 'LinkedIn'].map(p => (
                <button key={p} onClick={() => setPlatform(p)} style={{ flex: 1, padding: '0.45rem 0', borderRadius: 8, border: '1px solid', borderColor: platform === p ? 'var(--accent)' : 'var(--border)', background: platform === p ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', color: platform === p ? '#c4b5fd' : 'var(--muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Post topic *</span>
                <textarea rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={topic} onChange={e => setTopic(e.target.value)} placeholder={`What is the post about? e.g. "Launching our new service", "Behind the scenes at our studio", "5 tips for small businesses"`} />
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Tone</span>
                <select style={{ ...inp, cursor: 'pointer' }} value={tone} onChange={e => setTone(e.target.value)}>
                  <option value="engaging and authentic">Engaging & Authentic</option>
                  <option value="funny and witty">Funny & Witty</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                  <option value="bold and direct">Bold & Direct</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Call to action (optional)</span>
                <input style={inp} value={cta} onChange={e => setCta(e.target.value)} placeholder="e.g. Book a free call, Link in bio, DM us" />
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={!topic || loading} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: !topic || loading ? 0.5 : 1 }}>
            {loading ? '✨ Writing captions...' : `✨ Generate 3 ${platform} Captions`}
          </button>
        </div>

        {captions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {captions.map((caption, i) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd' }}>
                    CAPTION {i + 1}
                  </div>
                  <button onClick={async () => { await navigator.clipboard.writeText(caption); setCopied(i); setTimeout(() => setCopied(null), 2000) }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: copied === i ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {copied === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{caption.trim()}</pre>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: 'var(--dim)', textAlign: 'center', margin: 0 }}>Fill in the details and generate your captions</p>
          </div>
        )}
      </div>
    </div>
  )
}
