'use client'

import { useState, useEffect, useCallback } from 'react'

interface AccessGrant { id: string; collaboratorEmail: string; collaboratorId: string | null; createdAt: string }
interface Business { id: string; name: string; description: string }

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual',       label: 'Casual & Friendly' },
  { value: 'exciting',     label: 'Exciting & Hype' },
  { value: 'educational',  label: 'Educational' },
]

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }
const inp: React.CSSProperties = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }
const lbl: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 4, display: 'block' }
const hint: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--dim)', marginTop: 4 }

export default function SettingsPage() {
  const [form, setForm] = useState({
    businessName: '', businessDesc: '', telegramToken: '',
    telegramChannel: '', tiktokHandle: '', contentTone: 'professional',
    autoNurtureOnLead: false, autoReplyOnLeadCapture: false,
    emailFrom: '', emailPassword: '',
    receptionistEnabled: false,
    receptionistName: '',
    receptionistHours: '',
    receptionistServices: '',
    receptionistBookingLink: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState('')
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null)
  const [newBizName, setNewBizName] = useState('')
  const [addingBiz, setAddingBiz] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const loadAccess = useCallback(async () => {
    const res = await fetch('/api/team-access')
    const data = await res.json()
    setAccessGrants(Array.isArray(data) ? data : [])
  }, [])

  const loadBusinesses = useCallback(async () => {
    const res = await fetch('/api/businesses')
    const data = await res.json()
    setBusinesses(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data) setForm(f => ({ ...f, ...data }))
      setLoading(false)
    })
    loadAccess()
    loadBusinesses()
    const match = document.cookie.match(/nx_current_business=([^;]+)/)
    if (match) setCurrentBusinessId(match[1])
  }, [loadAccess, loadBusinesses])

  async function addBusiness() {
    if (!newBizName) return
    setAddingBiz(true)
    try {
      await fetch('/api/businesses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBizName }),
      })
      setNewBizName('')
      await loadBusinesses()
    } finally { setAddingBiz(false) }
  }

  async function deleteBusiness(id: string) {
    if (!confirm('Delete this business and unlink all its data?')) return
    await fetch(`/api/businesses/${id}`, { method: 'DELETE' })
    if (currentBusinessId === id) selectBusiness(null)
    await loadBusinesses()
  }

  async function selectBusiness(id: string | null) {
    await fetch('/api/businesses/select', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: id }),
    })
    setCurrentBusinessId(id)
    window.location.reload()
  }

  async function inviteCollaborator() {
    if (!inviteEmail) return
    setInviting(true); setInviteError('')
    try {
      const res = await fetch('/api/team-access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInviteEmail('')
      await loadAccess()
    } catch (e: unknown) { setInviteError(e instanceof Error ? e.message : 'Failed') }
    finally { setInviting(false) }
  }

  async function revokeAccess(id: string) {
    await fetch(`/api/team-access/${id}`, { method: 'DELETE' })
    await loadAccess()
  }

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function testTelegram() {
    if (!form.telegramToken || !form.telegramChannel) {
      setTestResult('Enter your bot token and channel ID first.')
      return
    }
    setTesting(true)
    setTestResult('')
    try {
      const res = await fetch(`https://api.telegram.org/bot${form.telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: form.telegramChannel, text: '✅ Nexova is connected to this channel!' }),
      })
      const data = await res.json()
      setTestResult(data.ok ? '✅ Success! Check your Telegram channel.' : `❌ Error: ${data.description}`)
    } catch {
      setTestResult('❌ Failed to connect.')
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div style={{ padding: '2.5rem', color: 'var(--dim)' }}>Loading...</div>

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Configure your business profile and connected accounts</p>
      </div>

      {/* Business */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>🏢 Your Business</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <span style={lbl}>Business Name</span>
            <input style={inp} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Bella's Bakery" />
          </div>
          <div>
            <span style={lbl}>What does your business do?</span>
            <textarea
              rows={3}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
              value={form.businessDesc}
              onChange={e => set('businessDesc', e.target.value)}
              placeholder="e.g. We sell handmade cakes and pastries in Sofia. We deliver in 24 hours."
            />
            <p style={hint}>The AI uses this to generate relevant content and emails for your business.</p>
          </div>
        </div>
      </div>

      {/* Email sending */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>📧 Email Sending</h2>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          Emails to leads will be sent FROM this address. Leave blank to use the platform default.
          <br />To get an app password: Google Account → Security → 2-Step Verification → App passwords → create one for "Mail".
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.875rem' }}>
          <div>
            <span style={lbl}>Gmail address</span>
            <input style={inp} type="email" value={form.emailFrom} onChange={e => set('emailFrom', e.target.value)} placeholder="gogonikolov@gmail.com" />
          </div>
          <div>
            <span style={lbl}>Gmail App Password (not your normal password)</span>
            <input style={inp} type="password" value={form.emailPassword} onChange={e => set('emailPassword', e.target.value)} placeholder="xxxx xxxx xxxx xxxx" />
          </div>
        </div>
      </div>

      {/* Telegram */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>✈️ Telegram</h2>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          Create a bot at <strong style={{ color: 'var(--muted)' }}>@BotFather</strong> on Telegram, then add it as admin to your channel.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <span style={lbl}>Bot Token</span>
            <input style={inp} value={form.telegramToken} onChange={e => set('telegramToken', e.target.value)} placeholder="123456789:AAF..." type="password" />
            <p style={hint}>From @BotFather → /newbot → copy the token</p>
          </div>
          <div>
            <span style={lbl}>Channel ID</span>
            <input style={inp} value={form.telegramChannel} onChange={e => set('telegramChannel', e.target.value)} placeholder="@yourchannel or -1001234567890" />
            <p style={hint}>Use @channelname or the numeric ID</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={testTelegram}
              disabled={testing}
              style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {testing ? 'Testing...' : '🔌 Test Connection'}
            </button>
            {testResult && <span style={{ fontSize: '0.875rem', color: testResult.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{testResult}</span>}
          </div>
        </div>
      </div>

      {/* TikTok */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>🎵 TikTok</h2>
        <div>
          <span style={lbl}>Your TikTok Handle</span>
          <input style={inp} value={form.tiktokHandle} onChange={e => set('tiktokHandle', e.target.value)} placeholder="@yourbusiness" />
          <p style={hint}>Used to personalize generated TikTok scripts</p>
        </div>
      </div>

      {/* Content tone */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', marginTop: 0 }}>✨ Content Style</h2>
        <span style={lbl}>Tone for generated posts and emails</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TONES.map(t => (
            <button
              key={t.value}
              onClick={() => set('contentTone', t.value)}
              style={{
                background: form.contentTone === t.value ? 'rgba(124,58,237,0.12)' : 'var(--bg2)',
                border: `1px solid ${form.contentTone === t.value ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`,
                color: form.contentTone === t.value ? '#c4b5fd' : 'var(--muted)',
                borderRadius: 10, padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>🏢 Your Businesses</h2>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          Manage multiple businesses from one account. Click one to switch — CRM, Invoices, and Scheduler will only show that business&apos;s data.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: '1rem' }}>
          <button onClick={() => selectBusiness(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: !currentBusinessId ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${!currentBusinessId ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, borderRadius: 10, padding: '0.625rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: !currentBusinessId ? '#c4b5fd' : 'var(--text)' }}>All businesses</span>
            {!currentBusinessId && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#86efac' }}>✓ Active</span>}
          </button>
          {businesses.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => selectBusiness(b.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: currentBusinessId === b.id ? 'rgba(124,58,237,0.12)' : 'var(--bg2)', border: `1px solid ${currentBusinessId === b.id ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, borderRadius: 10, padding: '0.625rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: currentBusinessId === b.id ? '#c4b5fd' : 'var(--text)' }}>{b.name}</span>
                {currentBusinessId === b.id && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#86efac' }}>✓ Active</span>}
              </button>
              <button onClick={() => deleteBusiness(b.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.5rem' }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={inp} value={newBizName} onChange={e => setNewBizName(e.target.value)} placeholder="New business name e.g. Robot Factory" onKeyDown={e => e.key === 'Enter' && addBusiness()} />
          <button onClick={addBusiness} disabled={!newBizName || addingBiz}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, opacity: !newBizName || addingBiz ? 0.5 : 1 }}>
            + Add
          </button>
        </div>
      </div>

      {/* AI Receptionist */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>🤖 AI Receptionist</h2>
          <div onClick={() => set('receptionistEnabled', !form.receptionistEnabled)}
            style={{ width: 40, height: 22, background: form.receptionistEnabled ? 'rgba(124,58,237,0.7)' : 'var(--bg2)', border: `1px solid ${form.receptionistEnabled ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`, borderRadius: 99, position: 'relative' as const, transition: 'all 0.2s', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ position: 'absolute' as const, top: 2, left: form.receptionistEnabled ? 20 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
          </div>
        </div>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          When someone fills your Lead Capture form, the AI instantly replies on your behalf — 24/7, even at 2am.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.875rem', opacity: form.receptionistEnabled ? 1 : 0.4, pointerEvents: form.receptionistEnabled ? 'auto' : 'none' }}>
          <div>
            <span style={lbl}>AI name (how it signs off)</span>
            <input style={inp} value={form.receptionistName} onChange={e => set('receptionistName', e.target.value)} placeholder="e.g. Виктория, Салон Виктория" />
          </div>
          <div>
            <span style={lbl}>Services you offer</span>
            <textarea rows={2} style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.6 }}
              value={form.receptionistServices} onChange={e => set('receptionistServices', e.target.value)}
              placeholder="e.g. Нокти, вежди, мигли. Цени от 30 до 80 лв." />
            <p style={hint}>The AI mentions these when someone asks about pricing or services.</p>
          </div>
          <div>
            <span style={lbl}>Working hours</span>
            <input style={inp} value={form.receptionistHours} onChange={e => set('receptionistHours', e.target.value)}
              placeholder="e.g. Понеделник–Събота, 10:00–19:00" />
          </div>
          <div>
            <span style={lbl}>Booking link (optional)</span>
            <input style={inp} value={form.receptionistBookingLink} onChange={e => set('receptionistBookingLink', e.target.value)}
              placeholder="e.g. https://booksy.com/yoursalon" />
            <p style={hint}>If you have an online booking system, the AI will include this link in the reply.</p>
          </div>
          {form.receptionistEnabled && form.receptionistName && (
            <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '0.875rem 1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0 0 6px', fontWeight: 600 }}>Preview reply:</p>
              <p style={{ fontSize: '0.8375rem', color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>
                Здравейте! Благодаря, че се свързахте с нас.{form.receptionistServices ? ` Предлагаме: ${form.receptionistServices}.` : ''}{form.receptionistHours ? ` Работим ${form.receptionistHours}.` : ''}{form.receptionistBookingLink ? ` Запазете час тук: ${form.receptionistBookingLink}` : ' Ще се свържем с вас скоро.'}<br /><br />— {form.receptionistName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Automation Rules */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>⚡ Automation Rules</h2>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          Turn these on and they run automatically — no clicking needed.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.875rem' }}>
          {[
            { key: 'autoNurtureOnLead', title: 'Auto-nurture new leads', desc: 'Every new lead (from CRM or your Lead Capture form) automatically gets a 3-email follow-up sequence scheduled.' },
            { key: 'autoReplyOnLeadCapture', title: 'Instant auto-reply', desc: 'Anyone who submits your Lead Capture form gets an immediate "thanks for reaching out" email.' },
          ].map(rule => (
            <label key={rule.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <div onClick={() => set(rule.key, !(form as Record<string, unknown>)[rule.key])}
                style={{ width: 40, height: 22, background: (form as Record<string, unknown>)[rule.key] ? 'rgba(124,58,237,0.7)' : 'var(--bg2)', border: `1px solid ${(form as Record<string, unknown>)[rule.key] ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`, borderRadius: 99, position: 'relative' as const, transition: 'all 0.2s', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                <div style={{ position: 'absolute' as const, top: 2, left: (form as Record<string, unknown>)[rule.key] ? 20 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{rule.title}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--dim)', lineHeight: 1.5 }}>{rule.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Team Access */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>🔑 Give Access</h2>
        <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', marginBottom: '1rem', marginTop: 0 }}>
          Invite someone (like the person who set this up for you) to manage your account — they sign in with their own login, no password sharing needed.
        </p>
        {inviteError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.8125rem' }}>{inviteError}</div>}
        <div style={{ display: 'flex', gap: 8, marginBottom: accessGrants.length ? '1rem' : 0 }}>
          <input style={inp} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="their@email.com" onKeyDown={e => e.key === 'Enter' && inviteCollaborator()} />
          <button onClick={inviteCollaborator} disabled={!inviteEmail || inviting}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, opacity: !inviteEmail || inviting ? 0.5 : 1 }}>
            {inviting ? '...' : 'Invite'}
          </button>
        </div>
        {accessGrants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {accessGrants.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                <span style={{ flex: 1, fontSize: '0.825rem', color: 'var(--text)' }}>{g.collaboratorEmail}</span>
                <span style={{ fontSize: '0.7rem', color: g.collaboratorId ? '#86efac' : '#fbbf24' }}>{g.collaboratorId ? 'Active' : 'Pending signup'}</span>
                <button onClick={() => revokeAccess(g.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{
          background: saved ? 'rgba(34,197,94,0.8)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
          color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 2rem',
          fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(124,58,237,0.25)', opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* Change Password */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', marginTop: 0 }}>🔒 Change Password</h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.875rem' }}>
          <div>
            <span style={lbl}>Current Password</span>
            <input style={inp} type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Your current password" />
          </div>
          <div>
            <span style={lbl}>New Password</span>
            <input style={inp} type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} placeholder="New password" />
          </div>
          <div>
            <span style={lbl}>Confirm New Password</span>
            <input style={inp} type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />
          </div>
          {pwMsg && <div style={{ fontSize: '0.825rem', color: pwMsg.startsWith('✓') ? '#86efac' : '#fca5a5' }}>{pwMsg}</div>}
          <button
            disabled={pwSaving}
            onClick={async () => {
              if (!pwForm.current || !pwForm.next) return setPwMsg('Fill in all fields.')
              if (pwForm.next !== pwForm.confirm) return setPwMsg('Passwords do not match.')
              if (pwForm.next.length < 6) return setPwMsg('New password must be at least 6 characters.')
              setPwSaving(true); setPwMsg('')
              const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: pwForm.current, next: pwForm.next }) })
              const data = await res.json()
              setPwMsg(res.ok ? '✓ Password changed!' : data.error || 'Failed.')
              if (res.ok) setPwForm({ current: '', next: '', confirm: '' })
              setPwSaving(false)
            }}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' as const, opacity: pwSaving ? 0.6 : 1 }}
          >
            {pwSaving ? 'Saving...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
