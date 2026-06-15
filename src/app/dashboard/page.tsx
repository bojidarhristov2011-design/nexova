import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const uid = session!.user.id

  const [
    totalContacts, leads, customers,
    totalInvoices, paidInvoices, revenueResult,
    totalAgents, scheduledPosts, sentPosts,
  ] = await Promise.all([
    db.contact.count({ where: { userId: uid } }),
    db.contact.count({ where: { userId: uid, status: 'lead' } }),
    db.contact.count({ where: { userId: uid, status: 'customer' } }),
    db.invoice.count({ where: { userId: uid } }),
    db.invoice.count({ where: { userId: uid, status: 'paid' } }),
    db.invoice.aggregate({ where: { userId: uid, status: 'paid' }, _sum: { total: true } }),
    db.agent.count({ where: { userId: uid } }),
    db.scheduledPost.count({ where: { userId: uid, status: 'pending' } }),
    db.scheduledPost.count({ where: { userId: uid, status: 'sent' } }),
  ])

  const revenue = revenueResult._sum.total ?? 0
  const recentInvoices = await db.invoice.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 5 })
  const recentContacts = await db.contact.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 5 })

  const stats = [
    { label: 'Contacts',   value: totalContacts, sub: `${leads} leads · ${customers} customers`, icon: '👥', href: '/dashboard/crm',          color: '#818cf8' },
    { label: 'Revenue',    value: `€${revenue.toFixed(0)}`,  sub: `${paidInvoices}/${totalInvoices} invoices paid`, icon: '💶', href: '/dashboard/invoices',    color: '#34d399' },
    { label: 'AI Agents',  value: totalAgents,   sub: 'Active chatbots',              icon: '🤖', href: '/dashboard/agents',      color: '#a78bfa' },
    { label: 'Posts Sent', value: sentPosts,     sub: `${scheduledPosts} pending`,   icon: '📅', href: '/dashboard/scheduler',   color: '#f472b6' },
  ]

  const shortcuts = [
    { href: '/dashboard/crm',          icon: '👥', label: 'Add Contact',      desc: 'Track a new lead or customer' },
    { href: '/dashboard/invoices',     icon: '🧾', label: 'New Invoice',       desc: 'Send a professional invoice' },
    { href: '/dashboard/email-writer', icon: '✉️', label: 'Write Email',       desc: 'AI-written in seconds' },
    { href: '/dashboard/content',      icon: '✨', label: 'Generate Content',  desc: 'Post to Telegram & TikTok' },
    { href: '/dashboard/scheduler',    icon: '📅', label: 'Schedule Post',     desc: 'Auto-publish at a set time' },
    { href: '/dashboard/agents/new',   icon: '🤖', label: 'New AI Agent',      desc: 'Build a chatbot for a client' },
  ]

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Welcome back 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Here's what's happening with your business today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', transition: 'border-color 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: s.color, letterSpacing: '-0.04em', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--dim)' }}>{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {shortcuts.map(s => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'border-color 0.15s' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{s.label}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.8rem', marginTop: 2 }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent contacts */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Recent Contacts</h2>
            <Link href="/dashboard/crm" style={{ fontSize: '0.8rem', color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentContacts.length === 0 ? (
            <p style={{ color: 'var(--dim)', fontSize: '0.875rem', margin: 0 }}>No contacts yet. <Link href="/dashboard/crm" style={{ color: '#a78bfa' }}>Add one →</Link></p>
          ) : recentContacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>{c.company || c.email || c.status}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, borderRadius: 5, padding: '2px 6px', ...(c.status === 'customer' ? { background: 'rgba(34,197,94,0.1)', color: '#86efac' } : { background: 'rgba(59,130,246,0.1)', color: '#93c5fd' }) }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent invoices */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Recent Invoices</h2>
            <Link href="/dashboard/invoices" style={{ fontSize: '0.8rem', color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p style={{ color: 'var(--dim)', fontSize: '0.875rem', margin: 0 }}>No invoices yet. <Link href="/dashboard/invoices" style={{ color: '#a78bfa' }}>Create one →</Link></p>
          ) : recentInvoices.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.875rem' }}>{inv.invoiceNumber} · {inv.clientName}</div>
                <div style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>€{inv.total.toFixed(0)}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, borderRadius: 5, padding: '1px 6px', ...(inv.status === 'paid' ? { background: 'rgba(34,197,94,0.1)', color: '#86efac' } : inv.status === 'sent' ? { background: 'rgba(59,130,246,0.1)', color: '#93c5fd' } : { background: 'rgba(107,114,128,0.1)', color: '#9ca3af' }) }}>
                  {inv.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
