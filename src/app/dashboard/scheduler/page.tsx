'use client'

import { useState, useEffect, useCallback } from 'react'

interface ScheduledPost {
  id: string
  platform: string
  content: string
  scheduledAt: string
  status: string
  createdAt: string
}

const statusStyle = (s: string): React.CSSProperties => ({
  pending: { background: 'rgba(234,179,8,0.12)',  color: '#fde047', border: '1px solid rgba(234,179,8,0.25)' },
  sent:    { background: 'rgba(34,197,94,0.12)',  color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' },
  failed:  { background: 'rgba(239,68,68,0.12)',  color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' },
}[s] ?? {}, { borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 })

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const primaryBtn: React.CSSProperties = { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const ghostBtn: React.CSSProperties = { background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 4, display: 'block' }

function toLocalDatetimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [platform, setPlatform] = useState('telegram')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/scheduler')
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const defaultTime = new Date()
    defaultTime.setHours(defaultTime.getHours() + 1, 0, 0, 0)
    setScheduledAt(toLocalDatetimeValue(defaultTime))
  }, [load])

  async function schedule() {
    if (!content || !scheduledAt) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, scheduledAt: new Date(scheduledAt).toISOString(), platform }),
      })
      if (!res.ok) throw new Error('Failed to schedule')
      setContent('')
      await load()
    } catch {
      setError('Failed to schedule post.')
    } finally {
      setSaving(false)
    }
  }

  async function sendDue() {
    setRunning(true)
    setRunResult('')
    setError('')
    try {
      const res = await fetch('/api/scheduler/send', { method: 'POST' })
      const data = await res.json()
      setRunResult(`Processed ${data.processed} post${data.processed !== 1 ? 's' : ''}`)
      await load()
    } catch {
      setError('Failed to run scheduler.')
    } finally {
      setRunning(false)
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this scheduled post?')) return
    await fetch(`/api/scheduler/${id}`, { method: 'DELETE' })
    await load()
  }

  const pending = posts.filter(p => p.status === 'pending')
  const done = posts.filter(p => p.status !== 'pending')

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Post Scheduler</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Schedule Telegram posts to go out automatically</p>
        </div>
        <button onClick={sendDue} disabled={running || pending.length === 0} style={{ ...ghostBtn, opacity: pending.length === 0 ? 0.5 : 1 }}>
          {running ? 'Sending...' : `▶ Send Due Posts (${pending.length})`}
        </button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{error}</div>}
      {runResult && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>✓ {runResult}</div>}

      {/* New post form */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>Schedule a Post</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={lbl}>Content</span>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder="Write your post here. You can also generate it in Content Studio and paste it here."
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <span style={lbl}>Platform</span>
            <select style={inp} value={platform} onChange={e => setPlatform(e.target.value)}>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          <div>
            <span style={lbl}>Send at</span>
            <input type="datetime-local" style={inp} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>
          <button onClick={schedule} disabled={saving || !content || !scheduledAt} style={{ ...primaryBtn, opacity: saving || !content || !scheduledAt ? 0.5 : 1, whiteSpace: 'nowrap' }}>
            {saving ? 'Scheduling...' : '+ Schedule'}
          </button>
        </div>
      </div>

      {/* Pending posts */}
      {loading ? (
        <p style={{ color: 'var(--dim)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scheduled ({pending.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {pending.map(p => (
                  <div key={p.id} style={{ ...card, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={statusStyle(p.status)}>{p.status}</span>
                        <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>
                          {p.platform} · {new Date(p.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.content.slice(0, 200)}{p.content.length > 200 ? '…' : ''}</p>
                    </div>
                    <button onClick={() => del(p.id)} style={{ ...ghostBtn, color: '#fca5a5', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {done.length > 0 && (
            <>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>History ({done.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {done.map(p => (
                  <div key={p.id} style={{ ...card, padding: '0.875rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: 0.7 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={statusStyle(p.status)}>{p.status}</span>
                        <span style={{ color: 'var(--dim)', fontSize: '0.8rem' }}>{new Date(p.scheduledAt).toLocaleString()}</span>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', margin: 0 }}>{p.content.slice(0, 120)}{p.content.length > 120 ? '…' : ''}</p>
                    </div>
                    <button onClick={() => del(p.id)} style={{ ...ghostBtn, color: '#fca5a5', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {posts.length === 0 && (
            <div style={{ ...card, textAlign: 'center', padding: '3rem 2rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📅</p>
              <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>No scheduled posts</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', margin: 0 }}>Write a post above and pick a time — it'll send automatically.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
