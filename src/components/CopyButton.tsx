'use client'

import { useState } from 'react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, color: copied ? '#86efac' : 'var(--muted)', borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'inherit' }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}
