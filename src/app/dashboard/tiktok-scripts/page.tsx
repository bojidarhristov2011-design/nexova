'use client'

import { useState } from 'react'

export default function TikTokScriptsPage() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('educational')
  const [duration, setDuration] = useState('30')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!topic) return
    setLoading(true)
    const res = await fetch('/api/tiktok-scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, style, duration }),
    })
    const data = await res.json()
    setScript(data.script || '')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🎵 TikTok Script Generator</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Generate viral TikTok video scripts for your business.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Video Topic</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Why laser hair removal is worth it"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14 }}>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="testimonial">Testimonial</option>
                <option value="behind-the-scenes">Behind the Scenes</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14 }}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={loading || !topic}
            style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </div>
      </div>

      {script && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Your Script</h2>
            <button onClick={() => navigator.clipboard.writeText(script)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Copy</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{script}</pre>
        </div>
      )}
    </div>
  )
}
