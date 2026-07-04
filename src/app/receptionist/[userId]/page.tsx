'use client'

import { useState, useRef, useEffect } from 'react'
import { use } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function ReceptionistWidget({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [receptionistName, setReceptionistName] = useState('Assistant')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/receptionist/public-info?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setBusinessName(d.businessName || '')
        setReceptionistName(d.receptionistName || 'Assistant')
        setMessages([{ role: 'assistant', content: `Hi! I'm ${d.receptionistName || 'your AI receptionist'} for ${d.businessName || 'this business'}. How can I help you today?` }])
        setStarted(true)
      })
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newHistory)
    setLoading(true)
    try {
      const res = await fetch('/api/public/receptionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: userMsg, history: messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setMessages([...newHistory, { role: 'assistant', content: data.reply || 'Sorry, I had trouble responding.' }])
    } catch {
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f1a', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: '#1a1a2e', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{receptionistName}</div>
          <div style={{ fontSize: 12, color: '#8888aa' }}>{businessName} · AI Receptionist</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }}></div>
          Online
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!started && <div style={{ textAlign: 'center', color: '#8888aa', marginTop: 40 }}>Loading...</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e1e35',
              fontSize: 14, lineHeight: 1.5,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: '#1e1e35', fontSize: 14, color: '#8888aa' }}>Typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a4a', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid #2a2a4a', background: '#1a1a2e', color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ padding: '10px 18px', borderRadius: 24, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
