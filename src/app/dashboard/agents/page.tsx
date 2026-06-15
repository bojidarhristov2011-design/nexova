'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Agent {
  id: string
  name: string
  description: string | null
  createdAt: string
}

const TEMPLATES = [
  {
    name: 'Customer Support',
    description: 'Answers customer questions about your products and services',
    instructions: 'You are a helpful customer support agent. Answer questions politely and professionally. If you don\'t know something specific about the business, say you\'ll escalate to the team. Keep answers concise and friendly.',
    greeting: 'Hi there! How can I help you today?',
  },
  {
    name: 'Sales Qualifier',
    description: 'Qualifies leads by understanding their needs, budget, and timeline',
    instructions: 'You are a sales assistant. Your goal is to qualify leads through friendly conversation. Ask about their main challenge, budget range, and timeline. Collect their name and email at the end to pass to the sales team.',
    greeting: 'Hello! I\'m here to help find the right solution for you. What challenge are you trying to solve?',
  },
  {
    name: 'FAQ Bot',
    description: 'Answers frequently asked questions using your business info',
    instructions: 'You are an FAQ assistant. Answer common questions briefly and helpfully. For complex or account-specific issues, direct users to contact the team directly.',
    greeting: 'Hi! Got a question? I\'ll do my best to help!',
  },
  {
    name: 'Appointment Booking',
    description: 'Collects contact info and preferred times for appointments',
    instructions: 'You are a booking assistant. Help visitors schedule appointments. Collect their name, email, phone number, preferred date and time, and reason for the appointment. Be friendly and professional.',
    greeting: 'Hello! I\'d love to help you book an appointment. Can I start with your name?',
  },
  {
    name: 'Billing & Invoice FAQ',
    description: 'Handles payment questions, invoice requests, and billing issues',
    instructions: 'You are a billing assistant. Help customers with invoice questions, payment methods, refunds, and billing inquiries. Be clear and reassuring. For account-specific billing issues, ask them to email your finance team.',
    greeting: 'Hi! Need help with a payment or invoice? I\'m here to assist.',
  },
  {
    name: 'HR & Onboarding',
    description: 'Helps new employees understand policies, tools, and procedures',
    instructions: 'You are an HR onboarding assistant. Help new team members understand company policies, benefits, tools, and day-to-day procedures. Be welcoming and thorough. For specific HR queries, direct them to the HR team.',
    greeting: 'Welcome to the team! I\'m here to help you get settled in. What would you like to know?',
  },
  {
    name: 'Lead Capture',
    description: 'Engages website visitors and captures their contact details',
    instructions: 'You are a friendly lead capture assistant. Engage visitors, ask what brought them to the site, and collect their name, email, and what they\'re looking for. Hand off warm leads to the sales team.',
    greeting: 'Hey! Welcome. Can I ask what you\'re looking for today?',
  },
  {
    name: 'Product Recommender',
    description: 'Asks questions and suggests the right product or service',
    instructions: 'You are a product recommendation assistant. Ask questions to understand what the customer needs, then recommend the most suitable product or service. Explain the benefits clearly and encourage them to take the next step.',
    greeting: 'Hi! Let me help you find exactly what you need. What brings you here today?',
  },
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(data => {
      setAgents(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  async function deleteAgent(id: string) {
    if (!confirm('Delete this agent? This cannot be undone.')) return
    await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    setAgents(a => a.filter(x => x.id !== id))
  }

  async function createFromTemplate(t: typeof TEMPLATES[0]) {
    setCreating(t.name)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t.name, description: t.description, instructions: t.instructions, greeting: t.greeting }),
      })
      if (res.ok) {
        const agent = await res.json()
        router.push(`/dashboard/agents/${agent.id}/test`)
      }
    } finally {
      setCreating(null)
    }
  }

  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column' }

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>AI Agents</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Build AI chatbots, embed them on any website, or share the link.</p>
        </div>
        <Link
          href="/dashboard/agents/new"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(124,58,237,0.25)', flexShrink: 0 }}
        >
          + New Agent
        </Link>
      </div>

      {/* Agents list */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Your Agents</h2>
        {loading ? (
          <p style={{ color: 'var(--dim)', fontSize: '0.875rem' }}>Loading...</p>
        ) : agents.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◈</div>
            <p style={{ color: 'var(--muted)', fontWeight: 600, margin: '0 0 0.375rem' }}>No agents yet</p>
            <p style={{ color: 'var(--dim)', fontSize: '0.875rem', margin: 0 }}>Create one from scratch or pick a template below.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {agents.map(a => (
              <div key={a.id} style={card}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.125rem', color: '#a78bfa' }}>◈</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9375rem' }}>{a.name}</span>
                  </div>
                  {a.description && (
                    <p style={{ color: 'var(--dim)', fontSize: '0.8125rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{a.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: '1rem' }}>
                  <Link
                    href={`/dashboard/agents/${a.id}/test`}
                    style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '0.4375rem 0', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center' }}
                  >
                    Open
                  </Link>
                  <Link
                    href={`/dashboard/agents/${a.id}`}
                    style={{ background: 'var(--bg2)', color: 'var(--muted)', textDecoration: 'none', borderRadius: 8, padding: '0.4375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border)' }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteAgent(a.id)}
                    style={{ background: 'rgba(239,68,68,0.07)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '0.4375rem 0.625rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Templates */}
      <div>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Start from a template</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => createFromTemplate(t)}
              disabled={creating !== null}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem',
                textAlign: 'left', cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating === t.name ? 0.6 : 1, fontFamily: 'inherit', transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, color: creating === t.name ? 'var(--muted)' : 'var(--text)', fontSize: '0.9rem', marginBottom: 4 }}>
                {creating === t.name ? 'Creating...' : t.name}
              </div>
              <div style={{ color: 'var(--dim)', fontSize: '0.78rem', lineHeight: 1.5 }}>{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
