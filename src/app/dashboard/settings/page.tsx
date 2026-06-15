'use client'

import { useState, useEffect } from 'react'

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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data) setForm(f => ({ ...f, ...data }))
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) {
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
    </div>
  )
}
