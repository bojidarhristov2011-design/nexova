'use client'

import { useState, useEffect } from 'react'

interface Survey { id: string; title: string; questions: string; responses: string; createdAt: string }

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState(['', '', ''])
  const [creating, setCreating] = useState(false)
  const [view, setView] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/surveys').then(r => r.json()).then(d => setSurveys(Array.isArray(d) ? d : []))
  }, [])

  async function create() {
    if (!title || questions.filter(Boolean).length === 0) return
    setCreating(true)
    const res = await fetch('/api/surveys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, questions: questions.filter(Boolean) }) })
    const survey = await res.json()
    setSurveys(s => [survey, ...s])
    setTitle('')
    setQuestions(['', '', ''])
    setCreating(false)
  }

  async function deleteSurvey(id: string) {
    await fetch('/api/surveys', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSurveys(s => s.filter(x => x.id !== id))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📋 Customer Surveys</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Create surveys to collect feedback from your clients.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Survey</h2>
        <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Survey Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="How was your experience?" style={{ ...inp, marginBottom: 16 }} />

        <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Questions</label>
        {questions.map((q, i) => (
          <input key={i} value={q} onChange={e => { const qs = [...questions]; qs[i] = e.target.value; setQuestions(qs) }}
            placeholder={`Question ${i + 1}`} style={{ ...inp, marginBottom: 8 }} />
        ))}
        <button onClick={() => setQuestions(q => [...q, ''])}
          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
          + Add Question
        </button>
        <br />
        <button onClick={create} disabled={creating}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {creating ? 'Creating...' : 'Create Survey'}
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Surveys ({surveys.length})</h2>
        {surveys.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No surveys yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {surveys.map(s => {
              const qs = JSON.parse(s.questions || '[]')
              const rs = JSON.parse(s.responses || '[]')
              return (
                <div key={s.id} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{qs.length} questions · {rs.length} responses</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setView(view === s.id ? null : s.id)}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
                        {view === s.id ? 'Hide' : 'View'}
                      </button>
                      <button onClick={() => deleteSurvey(s.id)}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  {view === s.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      {qs.map((q: string, i: number) => <div key={i} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{i + 1}. {q}</div>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
