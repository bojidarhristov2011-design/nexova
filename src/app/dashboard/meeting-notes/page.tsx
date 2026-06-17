'use client'
import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }

export default function MeetingNotesPage() {
  const [meetingTitle, setMeetingTitle] = usePersistedState('meeting_title', '')
  const [transcript, setTranscript] = usePersistedState('meeting_transcript', '')
  const [output, setOutput] = usePersistedState('meeting_output', '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!transcript.trim()) return
    setLoading(true); setOutput('')
    const res = await fetch('/api/meeting-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript, meetingTitle }) })
    const data = await res.json()
    setOutput(data.content || data.error || 'Error')
    setLoading(false)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>AI Meeting Notes</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Paste your meeting transcript and get a structured summary, decisions, and action items instantly.</p>
      </div>
      <div style={card}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Meeting Title (optional)</span>
          <input style={inp} value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} placeholder="e.g. Client kick-off call with Acme Ltd" />
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 5, display: 'block' }}>Meeting Transcript *</span>
          <textarea rows={10} style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here. Can be messy — AI will clean it up. Works with Zoom/Google Meet auto-transcripts too." />
        </div>
        <button onClick={generate} disabled={loading || !transcript.trim()} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !transcript.trim() ? 0.6 : 1, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          {loading ? 'Analysing meeting...' : '📋 Generate Meeting Notes'}
        </button>
      </div>
      {output && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Meeting Notes</h2>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--bg2)', color: copied ? '#86efac' : 'var(--muted)', border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`, borderRadius: 8, padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--muted)', fontSize: '0.875rem', margin: 0, fontFamily: 'inherit' }}>{output}</pre>
        </div>
      )}
    </div>
  )
}
