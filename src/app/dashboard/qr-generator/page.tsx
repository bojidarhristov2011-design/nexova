'use client'

import { useState } from 'react'

export default function QRGeneratorPage() {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [generated, setGenerated] = useState('')

  function generate() {
    if (!url.trim()) return
    const encoded = encodeURIComponent(url.trim())
    setGenerated(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📱 QR Code Generator</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Generate QR codes for your website, booking link, social media, or any URL.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>URL or Link</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourbusiness.com/book"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Label (optional)</label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Book an appointment"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

        <button onClick={generate}
          style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Generate QR Code
        </button>
      </div>

      {generated && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          {label && <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>{label}</p>}
          <img src={generated} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 8 }} />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, marginBottom: 16 }}>{url}</p>
          <a href={generated} download="qrcode.png"
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
            Download QR Code
          </a>
        </div>
      )}
    </div>
  )
}
