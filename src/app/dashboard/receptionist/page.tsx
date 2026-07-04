'use client'

import { useState, useEffect } from 'react'

export default function ReceptionistPage() {
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    receptionistName: 'Assistant',
    receptionistHours: '',
    receptionistServices: '',
    receptionistBookingLink: '',
    receptionistEnabled: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/receptionist').then(r => r.json()).then(d => setForm(f => ({ ...f, ...d })))
    fetch('/api/auth/session').then(r => r.json()).then(d => setUserId(d?.user?.id || ''))
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/receptionist', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const widgetUrl = userId ? `${window.location.origin}/receptionist/${userId}` : ''

  function copyLink() {
    navigator.clipboard.writeText(widgetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const embedCode = userId ? `<iframe src="${widgetUrl}" width="400" height="600" style="border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.2)"></iframe>` : ''

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>🤖 AI Receptionist</h1>
      <p style={{ color: '#8888aa', marginBottom: 32 }}>
        Set up an AI receptionist that answers questions, captures leads, and books appointments — 24/7 automatically.
      </p>

      {/* Enable toggle */}
      <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Enable Receptionist</div>
          <div style={{ fontSize: 13, color: '#8888aa' }}>When ON, the public chat link is active</div>
        </div>
        <button
          onClick={() => setForm(f => ({ ...f, receptionistEnabled: !f.receptionistEnabled }))}
          style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: form.receptionistEnabled ? '#6366f1' : '#2a2a4a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          {form.receptionistEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Config fields */}
      <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 6 }}>Receptionist Name</label>
          <input value={form.receptionistName} onChange={e => setForm(f => ({ ...f, receptionistName: e.target.value }))}
            placeholder="e.g. Sofia, Max, Alex"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 6 }}>Opening Hours</label>
          <input value={form.receptionistHours} onChange={e => setForm(f => ({ ...f, receptionistHours: e.target.value }))}
            placeholder="e.g. Mon-Fri 9am-6pm, Sat 10am-4pm"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 6 }}>Services (one per line)</label>
          <textarea value={form.receptionistServices} onChange={e => setForm(f => ({ ...f, receptionistServices: e.target.value }))}
            rows={4} placeholder="e.g.&#10;Haircut - €20&#10;Colour - €60&#10;Blowdry - €25"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#fff', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#8888aa', display: 'block', marginBottom: 6 }}>Booking Link (optional)</label>
          <input value={form.receptionistBookingLink} onChange={e => setForm(f => ({ ...f, receptionistBookingLink: e.target.value }))}
            placeholder="e.g. https://calendly.com/yourbusiness"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 32 }}>
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* Public link & embed */}
      {userId && (
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Share Your Receptionist</div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#8888aa', marginBottom: 8 }}>Chat Link — send this to customers or put it on your website</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={widgetUrl} readOnly
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#8888aa', fontSize: 13, boxSizing: 'border-box' }} />
              <button onClick={copyLink}
                style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: copied ? '#4ade80' : '#2a2a4a', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: '#8888aa', marginBottom: 8 }}>Embed Code — paste this into any website</div>
            <textarea value={embedCode} readOnly rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0f0f1a', color: '#8888aa', fontSize: 12, boxSizing: 'border-box', resize: 'none', fontFamily: 'monospace' }} />
          </div>
        </div>
      )}
    </div>
  )
}
