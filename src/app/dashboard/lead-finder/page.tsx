'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const LANGUAGES = ['English', 'Bulgarian', 'German', 'French', 'Spanish', 'Italian', 'Romanian', 'Dutch', 'Polish']

interface Business {
  placeId: string
  name: string
  address: string
  phone: string
  website: string
}

export default function LeadFinderPage() {
  // Search
  const [businessType, setBusinessType] = usePersistedState('lf_type', '')
  const [location, setLocation] = usePersistedState('lf_location', '')
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false)
  const [results, setResults] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selection + per-business emails
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [emailMap, setEmailMap] = useState<Record<string, string>>({})

  // Campaign
  const [offer, setOffer] = usePersistedState('lf_offer', '')
  const [problem, setProblem] = usePersistedState('lf_problem', '')
  const [language, setLanguage] = usePersistedState('lf_language', 'English')
  const [mode, setMode] = usePersistedState<'ai' | 'custom'>('lf_mode', 'ai')
  const [customSubject, setCustomSubject] = usePersistedState('lf_custom_subject', '')
  const [customBody, setCustomBody] = usePersistedState('lf_custom_body', '')

  // Preview + send
  const [previewSubject, setPreviewSubject] = useState('')
  const [previewBody, setPreviewBody] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState<{ name: string; email: string; success: boolean }[]>([])
  const [campaignError, setCampaignError] = useState('')

  async function search() {
    if (!businessType || !location) return
    setLoading(true); setError(''); setResults([])
    setSelected(new Set()); setEmailMap({})
    setPreviewSubject(''); setPreviewBody(''); setSendResults([])
    try {
      const res = await fetch('/api/lead-finder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, location, noWebsiteOnly }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setEmail(id: string, val: string) {
    setEmailMap(prev => ({ ...prev, [id]: val }))
  }

  function resetPreview() {
    setPreviewSubject(''); setPreviewBody('')
  }

  // Businesses that are checked AND have a valid email entered
  const readyContacts = results
    .filter(r => selected.has(r.placeId) && emailMap[r.placeId]?.includes('@'))
    .map(r => ({ name: r.name, email: emailMap[r.placeId] }))

  const needsEmail = selected.size - readyContacts.length

  async function generatePreview() {
    setGenerating(true); setCampaignError(''); resetPreview()
    try {
      const res = await fetch('/api/cold-email/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: [], offer, problem, target: businessType, previewOnly: true, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewSubject(data.subject)
      setPreviewBody(data.template)
    } catch (e: unknown) { setCampaignError(e instanceof Error ? e.message : 'Failed') }
    setGenerating(false)
  }

  async function sendEmails() {
    if (!readyContacts.length) return
    setSending(true); setCampaignError(''); setSendResults([])
    try {
      const res = await fetch('/api/cold-email/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: readyContacts,
          offer, problem, target: businessType, language,
          ...(mode === 'custom' ? { customSubject, customBody } : {}),
          ...(mode === 'ai' && previewSubject ? { customSubject: previewSubject, customBody: previewBody } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSendResults(data.results)
    } catch (e: unknown) { setCampaignError(e instanceof Error ? e.message : 'Failed') }
    setSending(false)
  }

  const sentCount = sendResults.filter(r => r.success).length
  const failedCount = sendResults.filter(r => !r.success).length

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Lead Finder</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Find businesses → select them → add their email → generate and send — all in one place.</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>{error}</div>}

      {/* Search */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Business type e.g. cosmetic salons *" style={inp} onKeyDown={e => e.key === 'Enter' && search()} />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location e.g. Sofia, Bulgaria *" style={inp} onKeyDown={e => e.key === 'Enter' && search()} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem', cursor: 'pointer', userSelect: 'none' as const }}>
          <input type="checkbox" checked={noWebsiteOnly} onChange={e => setNoWebsiteOnly(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>Only show businesses without a website</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>(great for selling web design)</span>
        </label>
        <button onClick={search} disabled={!businessType || !location || loading}
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', opacity: !businessType || !location || loading ? 0.5 : 1 }}>
          {loading ? 'Searching...' : 'Find Businesses'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Results list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{results.length} found · {selected.size} selected · {readyContacts.length} ready to send</span>
              <button onClick={() => selected.size === results.length ? setSelected(new Set()) : setSelected(new Set(results.map(r => r.placeId)))}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                {selected.size === results.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {results.map(r => {
                const isSelected = selected.has(r.placeId)
                const hasEmail = emailMap[r.placeId]?.includes('@')
                return (
                  <div key={r.placeId} onClick={() => toggleSelect(r.placeId)}
                    style={{ ...card, padding: '0.875rem 1rem', border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`, background: isSelected ? 'rgba(124,58,237,0.06)' : 'var(--surface)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(r.placeId)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer', marginTop: 3, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' as const }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{r.name}</span>
                          {!r.website && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 20, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', fontWeight: 600, flexShrink: 0 }}>No website</span>}
                          {isSelected && hasEmail && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600, flexShrink: 0 }}>Ready</span>}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: isSelected ? 8 : 0 }}>
                          {[r.phone, r.address].filter(Boolean).join(' · ')}
                        </div>
                        {r.website && !isSelected && <a href={r.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#a78bfa', fontSize: '0.78rem' }}>{r.website}</a>}
                        {isSelected && (
                          <input
                            type="email"
                            value={emailMap[r.placeId] || ''}
                            onChange={e => setEmail(r.placeId, e.target.value)}
                            placeholder="Enter their email address..."
                            style={{ ...inp, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Campaign panel */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem', position: 'sticky' as const, top: 24 }}>
            <div style={card}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginTop: 0, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Email Campaign</span>
                {readyContacts.length > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#a78bfa' }}>{readyContacts.length} ready</span>}
              </h2>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['ai', 'custom'] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); resetPreview() }}
                    style={{ flex: 1, padding: '6px', borderRadius: 8, border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`, background: mode === m ? 'rgba(124,58,237,0.12)' : 'transparent', color: mode === m ? '#a78bfa' : 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {m === 'ai' ? 'AI writes it' : 'I write it'}
                  </button>
                ))}
              </div>

              {mode === 'ai' ? (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  <textarea value={problem} onChange={e => { setProblem(e.target.value); resetPreview() }} rows={2}
                    placeholder="Problem they have: e.g. no website, losing customers online" style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.5 }} />
                  <textarea value={offer} onChange={e => { setOffer(e.target.value); resetPreview() }} rows={2}
                    placeholder="Your offer: e.g. I build websites in 5 days for €500" style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.5 }} />
                  <select value={language} onChange={e => { setLanguage(e.target.value); resetPreview() }} style={{ ...inp, cursor: 'pointer' }}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  <input value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Subject line" style={inp} />
                  <textarea value={customBody} onChange={e => setCustomBody(e.target.value)} rows={7}
                    placeholder={'Write your email...\n\nUse {name} to personalise.'} style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.6 }} />
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>Use <code style={{ background: 'var(--bg2)', padding: '1px 4px', borderRadius: 4 }}>{'{name}'}</code> to insert each business name</p>
                </div>
              )}
            </div>

            {/* AI preview */}
            {previewSubject && mode === 'ai' && !sendResults.length && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email preview</span>
                  <button onClick={resetPreview} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>Regenerate</button>
                </div>
                <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '7px 12px', marginBottom: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Subject: <strong style={{ color: 'var(--text)' }}>{previewSubject}</strong>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.8rem', lineHeight: 1.7, margin: 0 }}>{previewBody}</pre>
              </div>
            )}

            {/* Send results */}
            {sendResults.length > 0 && (
              <div style={card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  {sentCount > 0 && <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>✓ {sentCount} sent</span>}
                  {failedCount > 0 && <span style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.9rem' }}>✗ {failedCount} failed</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
                  {sendResults.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                      <span style={{ color: r.success ? '#4ade80' : '#fca5a5' }}>{r.success ? '✓' : '✗'}</span>
                      <span style={{ color: 'var(--text)', flex: 1 }}>{r.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {campaignError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{campaignError}</div>}

            {/* Generate button */}
            {mode === 'ai' && !previewSubject && (
              <button onClick={generatePreview} disabled={generating || !offer || !problem}
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: generating || !offer || !problem ? 'default' : 'pointer', fontFamily: 'inherit', opacity: generating || !offer || !problem ? 0.5 : 1 }}>
                {generating ? 'Generating...' : 'Generate Email'}
              </button>
            )}

            {/* Send button */}
            {(mode === 'custom' || previewSubject) && (() => {
              const disabled = sending || !readyContacts.length || (mode === 'custom' && (!customSubject || !customBody))
              return (
                <button onClick={sendEmails} disabled={disabled}
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.5 : 1 }}>
                  {sending ? `Sending to ${readyContacts.length}...` : readyContacts.length ? `Send to ${readyContacts.length} business${readyContacts.length !== 1 ? 'es' : ''}` : 'Select businesses + add their emails'}
                </button>
              )
            })()}

            {needsEmail > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0, textAlign: 'center' as const }}>
                {needsEmail} selected {needsEmail === 1 ? 'business needs' : 'businesses need'} an email address to be included
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
