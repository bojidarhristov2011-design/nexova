'use client'

import { useState } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'

const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem' }

const LANGUAGES = ['Bulgarian', 'English', 'German', 'French', 'Spanish', 'Italian', 'Romanian']

interface Business {
  placeId: string
  name: string
  address: string
  phone: string
  website: string
}

export default function LeadFinderPage() {
  const [businessType, setBusinessType] = usePersistedState('lf_type', '')
  const [location, setLocation] = usePersistedState('lf_location', '')
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false)
  const [results, setResults] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Selection + optional manual emails
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [emailMap, setEmailMap] = useState<Record<string, string>>({})
  const [findingEmail, setFindingEmail] = useState<Set<string>>(new Set())
  const [notFound, setNotFound] = useState<Set<string>>(new Set())

  // Outreach
  const [offer, setOffer] = usePersistedState('lf_offer', '')
  const [language, setLanguage] = usePersistedState('lf_language', 'Bulgarian')

  // Script generation
  const [script, setScript] = useState('')
  const [generatingScript, setGeneratingScript] = useState(false)
  const [scriptCopied, setScriptCopied] = useState(false)

  // Email campaign (for those where user manually found email)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [generatingEmail, setGeneratingEmail] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [sendResults, setSendResults] = useState<{ name: string; email: string; success: boolean }[]>([])
  const [campaignError, setCampaignError] = useState('')

  async function search() {
    if (!businessType || !location) return
    setLoading(true); setError(''); setResults([])
    setSelected(new Set()); setEmailMap({})
    setScript(''); setEmailSubject(''); setEmailBody(''); setSendResults([])
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

  async function findEmail(r: Business) {
    if (findingEmail.has(r.placeId) || emailMap[r.placeId]) return
    setFindingEmail(prev => new Set(prev).add(r.placeId))
    setNotFound(prev => { const n = new Set(prev); n.delete(r.placeId); return n })
    try {
      const res = await fetch('/api/lead-finder/find-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: r.name, city: location, website: r.website }),
      })
      const data = await res.json()
      if (data.email) {
        setEmailMap(prev => ({ ...prev, [r.placeId]: data.email }))
        setSelected(prev => new Set(prev).add(r.placeId))
      } else {
        setNotFound(prev => new Set(prev).add(r.placeId))
      }
    } catch { setNotFound(prev => new Set(prev).add(r.placeId)) }
    setFindingEmail(prev => { const n = new Set(prev); n.delete(r.placeId); return n })
  }

  async function findAllEmails() {
    for (const r of results) {
      if (!emailMap[r.placeId]) await findEmail(r)
    }
  }

  const selectedBusinesses = results.filter(r => selected.has(r.placeId))
  const readyForEmail = selectedBusinesses.filter(r => emailMap[r.placeId]?.includes('@'))

  async function generateScript() {
    if (!offer) return
    setGeneratingScript(true); setScript('')
    try {
      const res = await fetch('/api/cold-email/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: [], offer,
          problem: 'they have no online presence and lose customers who search online',
          target: businessType, previewOnly: true, language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmailSubject(data.subject)
      setEmailBody(data.template)
    } catch { /* ignore */ }
    setGeneratingScript(false)
  }

  async function generateWhatsApp() {
    if (!offer || selectedBusinesses.length === 0) return
    setGeneratingScript(true); setScript('')
    try {
      const res = await fetch('/api/ai-operator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Write a short WhatsApp outreach message in ${language} for a business owner.

My offer: ${offer}
Target: ${businessType} without a website
Their problem: they have no website and are invisible online

Rules:
- Max 4 sentences
- Casual, human, not salesy
- Start with their business name as {name}
- End with a soft question like "Would you be interested in a quick call?"
- No emojis unless it feels natural
- Sign with just my name

Reply with ONLY the message text, nothing else.`,
          }],
        }),
      })
      const data = await res.json()
      setScript(data.reply || '')
    } catch { /* ignore */ }
    setGeneratingScript(false)
  }

  async function sendEmailCampaign() {
    if (!readyForEmail.length || !emailSubject || !emailBody) return
    setSendingEmails(true); setCampaignError(''); setSendResults([])
    try {
      const res = await fetch('/api/cold-email/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: readyForEmail.map(r => ({ name: r.name, email: emailMap[r.placeId] })),
          offer, language,
          customSubject: emailSubject,
          customBody: emailBody,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSendResults(data.results)
    } catch (e: unknown) { setCampaignError(e instanceof Error ? e.message : 'Failed') }
    setSendingEmails(false)
  }

  async function copyScript() {
    await navigator.clipboard.writeText(script)
    setScriptCopied(true)
    setTimeout(() => setScriptCopied(false), 2000)
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Lead Finder</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Find businesses by type and location, then reach out by phone, WhatsApp, or email.</p>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 2 }}>(sell them web design)</span>
        </label>
        <button onClick={search} disabled={!businessType || !location || loading}
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', opacity: !businessType || !location || loading ? 0.5 : 1 }}>
          {loading ? 'Searching...' : 'Find Businesses'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Results */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{results.length} found · {selected.size} selected · {Object.keys(emailMap).length} emails found</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={findAllEmails} disabled={findingEmail.size > 0}
                  style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, opacity: findingEmail.size > 0 ? 0.5 : 1 }}>
                  {findingEmail.size > 0 ? `Finding... (${findingEmail.size} left)` : 'Find all emails'}
                </button>
                <button onClick={() => selected.size === results.length ? setSelected(new Set()) : setSelected(new Set(results.map(r => r.placeId)))}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {selected.size === results.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              {results.map(r => {
                const isSelected = selected.has(r.placeId)
                const hasEmail = emailMap[r.placeId]?.includes('@')
                return (
                  <div key={r.placeId} onClick={() => toggleSelect(r.placeId)}
                    style={{ ...card, border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`, background: isSelected ? 'rgba(124,58,237,0.06)' : 'var(--surface)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(r.placeId)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer', marginTop: 3, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' as const }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{r.name}</span>
                          {!r.website && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 20, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', fontWeight: 600 }}>No website</span>}
                          {hasEmail && <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600 }}>Email ready</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
                          {r.phone && (
                            <a href={`tel:${r.phone}`} onClick={e => e.stopPropagation()}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                              📞 {r.phone}
                            </a>
                          )}
                          {r.phone && (
                            <a href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                              WhatsApp →
                            </a>
                          )}
                          {!r.phone && <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No phone listed</span>}
                        </div>

                        <div style={{ color: 'var(--dim)', fontSize: '0.78rem', marginTop: 4 }}>{r.address}</div>

                        {r.website && (
                          <a href={r.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#a78bfa', fontSize: '0.75rem' }}>{r.website}</a>
                        )}

                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                          {emailMap[r.placeId] ? (
                            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 500 }}>✓ {emailMap[r.placeId]}</span>
                          ) : notFound.has(r.placeId) ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--dim)' }}>No email found</span>
                          ) : (
                            <button onClick={() => findEmail(r)} disabled={findingEmail.has(r.placeId)}
                              style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: findingEmail.has(r.placeId) ? 'default' : 'pointer', fontFamily: 'inherit', opacity: findingEmail.has(r.placeId) ? 0.6 : 1 }}>
                              {findingEmail.has(r.placeId) ? 'Searching...' : 'Find email'}
                            </button>
                          )}
                          {(emailMap[r.placeId] || isSelected) && (
                            <input
                              type="email"
                              value={emailMap[r.placeId] || ''}
                              onChange={e => setEmailMap(prev => ({ ...prev, [r.placeId]: e.target.value }))}
                              placeholder="or type email manually"
                              style={{ ...inp, padding: '0.35rem 0.65rem', fontSize: '0.78rem', flex: 1 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Outreach panel */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem', position: 'sticky' as const, top: 24 }}>

            {/* Settings */}
            <div style={card}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 0, marginBottom: '0.875rem' }}>Outreach Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <textarea value={offer} onChange={e => setOffer(e.target.value)} rows={2}
                  placeholder="Your offer: e.g. I build websites in 5 days for €500" style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.5 }} />
                <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* WhatsApp / call script */}
            <div style={card}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 0, marginBottom: 6 }}>WhatsApp / Call Script</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 12px' }}>
                Businesses without websites → reach them by phone or WhatsApp. Click the number above to call instantly.
              </p>
              <button onClick={generateWhatsApp} disabled={generatingScript || !offer}
                style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '0.7rem', fontSize: '0.875rem', fontWeight: 600, cursor: generatingScript || !offer ? 'default' : 'pointer', fontFamily: 'inherit', width: '100%', opacity: generatingScript || !offer ? 0.5 : 1 }}>
                {generatingScript ? 'Generating...' : 'Generate WhatsApp message'}
              </button>

              {script && (
                <div style={{ marginTop: 12 }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 10px', background: 'var(--bg2)', borderRadius: 8, padding: '0.75rem' }}>{script}</pre>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={copyScript}
                      style={{ flex: 1, background: scriptCopied ? 'rgba(34,197,94,0.12)' : 'var(--bg2)', color: scriptCopied ? '#4ade80' : 'var(--muted)', border: `1px solid ${scriptCopied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {scriptCopied ? '✓ Copied' : 'Copy'}
                    </button>
                    <button onClick={generateWhatsApp} disabled={generatingScript}
                      style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Redo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email section (for manually-found emails) */}
            <div style={card}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 0, marginBottom: 6 }}>Email Campaign</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 10px' }}>
                Found emails manually? Select businesses above and enter their emails to send a campaign.
              </p>

              {!emailSubject && (
                <button onClick={generateScript} disabled={generatingScript || !offer}
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontSize: '0.875rem', fontWeight: 600, cursor: generatingScript || !offer ? 'default' : 'pointer', fontFamily: 'inherit', width: '100%', opacity: generatingScript || !offer ? 0.5 : 1 }}>
                  {generatingScript ? 'Generating...' : 'Generate email'}
                </button>
              )}

              {emailSubject && (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '7px 12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Subject: <strong style={{ color: 'var(--text)' }}>{emailSubject}</strong>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text)', fontSize: '0.8rem', lineHeight: 1.7, margin: 0, background: 'var(--bg2)', borderRadius: 8, padding: '0.75rem' }}>{emailBody}</pre>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={generateScript} style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.45rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate</button>
                  </div>
                  {campaignError && <div style={{ color: '#fca5a5', fontSize: '0.8rem' }}>{campaignError}</div>}
                  {sendResults.length > 0 && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.875rem' }}>✓ {sendResults.filter(r => r.success).length} sent</span>
                      {sendResults.filter(r => !r.success).length > 0 && <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.875rem' }}>✗ {sendResults.filter(r => !r.success).length} failed</span>}
                    </div>
                  )}
                  <button onClick={sendEmailCampaign} disabled={sendingEmails || !readyForEmail.length}
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontSize: '0.875rem', fontWeight: 600, cursor: sendingEmails || !readyForEmail.length ? 'default' : 'pointer', fontFamily: 'inherit', opacity: sendingEmails || !readyForEmail.length ? 0.5 : 1 }}>
                    {sendingEmails ? 'Sending...' : readyForEmail.length ? `Send to ${readyForEmail.length} business${readyForEmail.length !== 1 ? 'es' : ''}` : 'Add emails above to send'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
