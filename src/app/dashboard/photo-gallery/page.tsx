'use client'

import { useState } from 'react'

interface Photo { id: string; before: string; after: string; label: string }

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [label, setLabel] = useState('')
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')

  function toBase64(file: File): Promise<string> {
    return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file) })
  }

  async function add() {
    if (!before || !after) return
    setPhotos(p => [...p, { id: Date.now().toString(), before, after, label }])
    setBefore(''); setAfter(''); setLabel('')
  }

  function remove(id: string) { setPhotos(p => p.filter(x => x.id !== id)) }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>📸 Before/After Photo Gallery</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Showcase your results with before and after photos.</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Photos</h2>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label e.g. Laser hair removal - legs"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Before Photo</label>
            <input type="file" accept="image/*" onChange={async e => { if (e.target.files?.[0]) setBefore(await toBase64(e.target.files[0])) }}
              style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }} />
            {before && <img src={before} style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 150, objectFit: 'cover' }} alt="before" />}
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>After Photo</label>
            <input type="file" accept="image/*" onChange={async e => { if (e.target.files?.[0]) setAfter(await toBase64(e.target.files[0])) }}
              style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }} />
            {after && <img src={after} style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 150, objectFit: 'cover' }} alt="after" />}
          </div>
        </div>
        <button onClick={add} disabled={!before || !after}
          style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Add to Gallery
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {photos.map(p => (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ position: 'relative' }}>
                <img src={p.before} style={{ width: '100%', height: 160, objectFit: 'cover' }} alt="before" />
                <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>Before</span>
              </div>
              <div style={{ position: 'relative' }}>
                <img src={p.after} style={{ width: '100%', height: 160, objectFit: 'cover' }} alt="after" />
                <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(124,58,237,0.8)', color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 4 }}>After</span>
              </div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{p.label || 'Result'}</span>
              <button onClick={() => remove(p.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 40 }}>No photos yet. Add your first before/after pair above.</p>}
    </div>
  )
}
