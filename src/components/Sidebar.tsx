'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { NexovaLogo } from './NexovaLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { BusinessIndicator } from './BusinessIndicator'

interface Props {
  user: { id: string; email: string; name?: string | null; actingAs?: boolean }
  isAdmin?: boolean
}

const CORE_SECTIONS = [
  {
    label: null,
    links: [
      { href: '/dashboard', label: 'Overview', icon: '⬡', exact: true },
    ],
  },
  {
    label: 'Business',
    links: [
      { href: '/dashboard/crm',          label: 'CRM',               icon: '👥' },
      { href: '/dashboard/lead-finder',   label: 'Lead Finder',       icon: '🔍' },
      { href: '/dashboard/lead-capture',  label: 'Lead Capture',      icon: '🎯' },
      { href: '/dashboard/invoices',      label: 'Invoices',          icon: '🧾' },
      { href: '/dashboard/quotes',        label: 'Quote Generator',   icon: '💰' },
      { href: '/dashboard/calendar',      label: 'Calendar',          icon: '📆' },
      { href: '/dashboard/meeting-notes', label: 'Meeting Notes',     icon: '📋' },
      { href: '/dashboard/onboarding',    label: 'Client Onboarding', icon: '🚀' },
    ],
  },
  {
    label: 'AI Writing',
    links: [
      { href: '/dashboard/email-writer',     label: 'Email Writer',      icon: '✉️' },
      { href: '/dashboard/proposals',        label: 'Proposals',         icon: '📄' },
      { href: '/dashboard/contracts',        label: 'Contracts',         icon: '📝' },
      { href: '/dashboard/price-list',       label: 'Price List',        icon: '💲' },
      { href: '/dashboard/bio-writer',       label: 'Business Bio',      icon: '🪪' },
      { href: '/dashboard/faq',              label: 'FAQ Generator',     icon: '❓' },
      { href: '/dashboard/legal',            label: 'Legal Docs',        icon: '⚖️' },
      { href: '/dashboard/blog-writer',      label: 'Blog Writer',       icon: '✍️' },
      { href: '/dashboard/reviews',          label: 'Review Replies',    icon: '⭐' },
      { href: '/dashboard/complaint-reply',  label: 'Complaint Reply',   icon: '🛡️' },
    ],
  },
  {
    label: 'Outreach',
    links: [
      { href: '/dashboard/whatsapp',   label: 'WhatsApp',          icon: '💬' },
      { href: '/dashboard/reminders',  label: 'Appt. Reminders',   icon: '🔔' },
      { href: '/dashboard/linkedin',   label: 'LinkedIn',          icon: '🔗' },
      { href: '/dashboard/cold-email', label: 'Cold Email Series', icon: '📨' },
    ],
  },
  {
    label: 'Content',
    links: [
      { href: '/dashboard/captions',   label: 'Caption Generator', icon: '📱' },
      { href: '/dashboard/ad-copy',    label: 'Ad Copy (Meta)',    icon: '📣' },
      { href: '/dashboard/content',    label: 'Content Studio',    icon: '✨' },
      { href: '/dashboard/scheduler',  label: 'Scheduler',         icon: '📅' },
    ],
  },
  {
    label: 'Automate',
    links: [
      { href: '/dashboard/operator',          label: 'Business Operator', icon: '◈' },
      { href: '/dashboard/sales-automation',  label: 'Sales Automation',  icon: '📈' },
      { href: '/dashboard/agents',            label: 'Chat Agents',       icon: '💬' },
      { href: '/dashboard/receptionist',      label: 'AI Receptionist',   icon: '🤖' },
    ],
  },
]

// Premium features — only shown if user has the slug enabled
const PREMIUM_LINKS: Record<string, { href: string; label: string; icon: string; section: string }> = {
  'qr-generator':       { href: '/dashboard/qr-generator',      label: 'QR Generator',       icon: '📱', section: 'Premium' },
  'review-requests':    { href: '/dashboard/review-requests',    label: 'Review Requests',    icon: '⭐', section: 'Premium' },
  'birthday-messages':  { href: '/dashboard/birthday-messages',  label: 'Birthday Messages',  icon: '🎂', section: 'Premium' },
  'loyalty':            { href: '/dashboard/loyalty',            label: 'Loyalty Points',     icon: '🏆', section: 'Premium' },
  'staff':              { href: '/dashboard/staff',              label: 'Staff Management',   icon: '👤', section: 'Premium' },
  'surveys':            { href: '/dashboard/surveys',            label: 'Surveys',            icon: '📋', section: 'Premium' },
}

export function Sidebar({ user, isAdmin }: Props) {
  const pathname = usePathname()
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/features').then(r => r.json()).then(d => setEnabledFeatures(Array.isArray(d) ? d : []))
  }, [])

  const premiumLinks = enabledFeatures
    .filter(slug => PREMIUM_LINKS[slug])
    .map(slug => PREMIUM_LINKS[slug])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function NavLink({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) {
    const active = isActive(href, exact)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4375rem 0.75rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
        textDecoration: 'none',
        background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
        color: active ? '#c4b5fd' : 'var(--muted)',
        transition: 'background 0.12s, color 0.12s',
      }}>
        <span style={{ fontSize: '0.9375rem', width: 18, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        {label}
      </Link>
    )
  }

  return (
    <aside style={{ width: 220, minWidth: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1rem 0', overflowY: 'auto' }}>
      <div style={{ padding: '0 1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <NexovaLogo size={28} />
        <span style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nexova
        </span>
      </div>

      <BusinessIndicator />

      <nav style={{ flex: 1, padding: '0 0.625rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {CORE_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: '0.25rem' }}>
            {section.label && (
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.25rem' }}>
                {section.label}
              </div>
            )}
            {section.links.map(link => <NavLink key={link.href} {...link} />)}
          </div>
        ))}

        {/* Premium features */}
        {premiumLinks.length > 0 && (
          <div style={{ marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.25rem' }}>
              Premium
            </div>
            {premiumLinks.map(link => <NavLink key={link.href} {...link} />)}
          </div>
        )}

        <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.25rem' }}>Language</div>
          <LanguageSwitcher />
        </div>

        <div style={{ marginTop: '0.25rem' }}>
          {[
            { href: '/dashboard/help', label: 'Help & Support', icon: '💡' },
            { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
            ...(isAdmin ? [
              { href: '/dashboard/admin', label: 'Admin', icon: '🔑' },
              { href: '/dashboard/admin/features', label: 'Feature Manager', icon: '🔧' },
            ] : []),
          ].map(link => <NavLink key={link.href} {...link} />)}
        </div>
      </nav>

      <div style={{ padding: '0 0.625rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginTop: '0.875rem' }}>
        <WorkspaceSwitcher actingAs={user.actingAs ?? false} currentName={user.name} />
        <div style={{ padding: '0.25rem 0.75rem 0.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.email}</div>
          {user.name && <div style={{ fontSize: '0.72rem', color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>}
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.4375rem 0.75rem', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--dim)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
          ↩ Sign out
        </button>
      </div>
    </aside>
  )
}
