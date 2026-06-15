'use client'

import { useState, useEffect } from 'react'
import { usePersistedState } from '@/hooks/usePersistedState'
import Link from 'next/link'

const NEUTRAL_TOPICS = [
  'Share a customer success story',
  'Announce a new product or service',
  'Behind the scenes of how we work',
  'Tips and advice for our customers',
  'Answer a question we get asked often',
  'Seasonal promotion or special offer',
  'What makes us different from competitors',
  'Team spotlight or recent achievement',
]

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }
const btn = (color = 'accent'): React.CSSProperties => ({
  background: color === 'accent' ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : color,
  color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem',
  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: '0 4px 16px rgba(124,58,237,0.25)', transition: 'opacity 0.15s',
})

export default function ContentPage() {
  const [selectedTopic, setSelectedTopic] = usePersistedState('content_topic', '')
  const [customTopic, setCustomTopic] = usePersistedState('content_custom', '')
  const [telegramPost, setTelegramPost] = usePersistedState('content_telegram', '')
  const [tiktokScript, setTiktokScript] = usePersistedState('content_tiktok', '')
  const [topics, setTopics] = useState<string[]>(NEUTRAL_TOPICS)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [hasSettings, setHasSettings] = useState(false)
  const [generating, setGenerating] = useState<'telegram' | 'tiktok' | null>(null)
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check session storage cache first to avoid re-calling AI on every visit
    const cached = sessionStorage.getItem('nexova_business_topics')
    const cachedName = sessionStorage.getItem('nexova_business_topics_name')

    fetch('/api/settings').then(r => r.json()).then(data => {
      const name = data?.businessName?.trim()
      if (name) {
        setBusinessName(name)
        setHasSettings(true)

        // Use cache if it's for the same business name
        if (cached && cachedName === name) {
          try { setTopics(JSON.parse(cached)); return } catch {}
        }

        // Otherwise fetch fresh AI topics
        setLoadingTopics(true)
        fetch('/api/content/topics')
          .then(r => r.json())
          .then(d => {
            if (d.topics && d.topics.length > 0) {
              setTopics(d.topics)
              sessionStorage.setItem('nexova_business_topics', JSON.stringify(d.topics))
              sessionStorage.setItem('nexova_business_topics_name', name)
            }
          })
          .catch(() => {})
          .finally(() => setLoadingTopics(false))
      }
    }).catch(() => {})
  }, [])

  const topic = customTopic || selectedTopic

  async function generate(type: 'telegram' | 'tiktok') {
    if (!topic) return
    setGenerating(type)
    setError('')
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsItem: topic, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (type === 'telegram') setTelegramPost(data.content)
      else setTiktokScript(data.content)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate. Try again.')
    } finally {
      setGenerating(null)
    }
  }

  async function postToTelegram() {
    if (!telegramPost) return
    setPosting(true)
    setError('')
    try {
      const res = await fetch('/api/content/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: telegramPost }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosted(true)
      setTimeout(() => setPosted(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Content Studio
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
          {hasSettings
            ? `Generating content for ${businessName} — powered by AI`
            : 'Generate posts and scripts for your business — powered by AI'}
        </p>
      </div>

      {!hasSettings && (
        <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <p style={{ color: '#c4b5fd', fontSize: '0.875rem', margin: 0 }}>
            💡 Set your business name and description in Settings to get personalised topics.
          </p>
          <Link href="/dashboard/settings" style={{ color: '#a78bfa', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Go to Settings →
          </Link>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 10, padding: '0.875rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Topic selector */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            1. Choose a topic
          </h2>
          {loadingTopics && (
            <span style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>Generating topics for your business...</span>
          )}
          {hasSettings && !loadingTopics && (
            <button
              onClick={() => {
                sessionStorage.removeItem('nexova_business_topics')
                sessionStorage.removeItem('nexova_business_topics_name')
                setLoadingTopics(true)
                fetch('/api/content/topics').then(r => r.json()).then(d => {
                  if (d.topics?.length) {
                    setTopics(d.topics)
                    sessionStorage.setItem('nexova_business_topics', JSON.stringify(d.topics))
                    sessionStorage.setItem('nexova_business_topics_name', businessName)
                  }
                }).finally(() => setLoadingTopics(false))
              }}
              style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ↻ Refresh topics
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
          {loadingTopics
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 32, width: 140 + (i % 3) * 30, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', opacity: 0.5 }} />
              ))
            : topics.map(t => (
                <button
                  key={t}
                  onClick={() => { setSelectedTopic(t); setCustomTopic('') }}
                  style={{
                    background: selectedTopic === t && !customTopic ? 'rgba(124,58,237,0.15)' : 'var(--bg2)',
                    border: `1px solid ${selectedTopic === t && !customTopic ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                    color: selectedTopic === t && !customTopic ? '#c4b5fd' : 'var(--muted)',
                    borderRadius: 8, padding: '0.375rem 0.75rem', fontSize: '0.8125rem',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))
          }
        </div>

        <input
          type="text"
          value={customTopic}
          onChange={e => { setCustomTopic(e.target.value); setSelectedTopic('') }}
          placeholder="Or type your own topic..."
          style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Telegram */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✈️</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Telegram Post</h2>
          </div>
          <button
            onClick={() => generate('telegram')}
            disabled={!topic || generating === 'telegram'}
            style={{ ...btn(), width: '100%', marginBottom: '1rem', opacity: !topic || generating === 'telegram' ? 0.5 : 1 }}
          >
            {generating === 'telegram' ? '✨ Writing...' : '✨ Generate Post'}
          </button>
          {telegramPost && (
            <>
              <textarea
                value={telegramPost}
                onChange={e => setTelegramPost(e.target.value)}
                rows={8}
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: '0.75rem' }}
              />
              <button
                onClick={postToTelegram}
                disabled={posting}
                style={{ ...btn(posted ? 'rgba(34,197,94,0.8)' : 'accent'), width: '100%' }}
              >
                {posting ? 'Posting...' : posted ? '✓ Posted!' : '🚀 Post to Telegram'}
              </button>
            </>
          )}
        </div>

        {/* TikTok */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎵</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>TikTok Script</h2>
          </div>
          <button
            onClick={() => generate('tiktok')}
            disabled={!topic || generating === 'tiktok'}
            style={{ ...btn(), width: '100%', marginBottom: '1rem', opacity: !topic || generating === 'tiktok' ? 0.5 : 1 }}
          >
            {generating === 'tiktok' ? '✨ Writing...' : '✨ Generate Script'}
          </button>
          {tiktokScript && (
            <>
              <textarea
                value={tiktokScript}
                onChange={e => setTiktokScript(e.target.value)}
                rows={8}
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, marginBottom: '0.75rem' }}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(tiktokScript); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ ...btn(copied ? 'rgba(34,197,94,0.8)' : 'accent'), width: '100%' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Script'}
              </button>
            </>
          )}
        </div>
      </div>

      <p style={{ color: 'var(--dim)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.5rem' }}>
        Your work is saved automatically — it stays here even if you navigate away.
      </p>
    </div>
  )
}
