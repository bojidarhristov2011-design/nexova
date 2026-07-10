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

const IC: Record<string, string> = {
  grid:          `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  users:         `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  search:        `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  target:        `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  'file-text':   `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
  receipt:       `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/><line x1="12" y1="16" x2="8" y2="16"/>`,
  calendar:      `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  clipboard:     `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>`,
  'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  mail:          `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
  file:          `<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>`,
  edit:          `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
  tag:           `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
  'id-card':     `<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><line x1="14" y1="10" x2="19" y2="10"/><line x1="14" y1="14" x2="19" y2="14"/>`,
  'help-circle': `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  scale:         `<line x1="12" y1="3" x2="12" y2="21"/><path d="M5 9l7-6 7 6"/><path d="M5 15l7 6 7-6"/>`,
  pencil:        `<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>`,
  star:          `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  shield:        `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  'msg-circle':  `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
  bell:          `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  link:          `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  send:          `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  phone:         `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  megaphone:     `<path d="M3 11l19-9v18L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>`,
  wand:          `<path d="M6.3 20.3a1 1 0 0 0 1.4 0L18 10l-4-4L3.7 16.9a1 1 0 0 0 0 1.4z"/><line x1="20" y1="7" x2="14" y2="13"/><path d="M16 4l4 4"/>`,
  'cal-check':   `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>`,
  zap:           `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  headphones:    `<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>`,
  'life-buoy':   `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>`,
  settings:      `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  key:           `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
  sliders:       `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`,
  award:         `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
  briefcase:     `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  list:          `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
  'msg-square':  `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  clock:         `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  gift:          `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`,
  box:           `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
  layers:        `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  image:         `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  'share-2':     `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
  video:         `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`,
  'credit-card': `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
  signout:       `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
}

function Icon({ id }: { id: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: IC[id] ?? IC.grid }}
    />
  )
}

const CORE_SECTIONS = [
  {
    label: null,
    links: [
      { href: '/dashboard', label: 'Overview', icon: 'grid', exact: true },
    ],
  },
  {
    label: 'Business',
    links: [
      { href: '/dashboard/crm',          label: 'CRM',               icon: 'users' },
      { href: '/dashboard/lead-finder',   label: 'Lead Finder',       icon: 'search' },
      { href: '/dashboard/lead-capture',  label: 'Lead Capture',      icon: 'target' },
      { href: '/dashboard/invoices',      label: 'Invoices',          icon: 'file-text' },
      { href: '/dashboard/quotes',        label: 'Quote Generator',   icon: 'receipt' },
      { href: '/dashboard/calendar',      label: 'Calendar',          icon: 'calendar' },
      { href: '/dashboard/meeting-notes', label: 'Meeting Notes',     icon: 'clipboard' },
      { href: '/dashboard/onboarding',    label: 'Client Onboarding', icon: 'arrow-right' },
    ],
  },
  {
    label: 'AI Writing',
    links: [
      { href: '/dashboard/email-writer',    label: 'Email Writer',     icon: 'mail' },
      { href: '/dashboard/proposals',       label: 'Proposals',        icon: 'file' },
      { href: '/dashboard/contracts',       label: 'Contracts',        icon: 'edit' },
      { href: '/dashboard/price-list',      label: 'Price List',       icon: 'tag' },
      { href: '/dashboard/bio-writer',      label: 'Business Bio',     icon: 'id-card' },
      { href: '/dashboard/faq',             label: 'FAQ Generator',    icon: 'help-circle' },
      { href: '/dashboard/legal',           label: 'Legal Docs',       icon: 'scale' },
      { href: '/dashboard/blog-writer',     label: 'Blog Writer',      icon: 'pencil' },
      { href: '/dashboard/reviews',         label: 'Review Replies',   icon: 'star' },
      { href: '/dashboard/complaint-reply', label: 'Complaint Reply',  icon: 'shield' },
    ],
  },
  {
    label: 'Outreach',
    links: [
      { href: '/dashboard/whatsapp',   label: 'WhatsApp',          icon: 'msg-circle' },
      { href: '/dashboard/reminders',  label: 'Appt. Reminders',   icon: 'bell' },
      { href: '/dashboard/linkedin',   label: 'LinkedIn',          icon: 'link' },
      { href: '/dashboard/cold-email', label: 'Cold Email Series', icon: 'send' },
    ],
  },
  {
    label: 'Content',
    links: [
      { href: '/dashboard/captions',  label: 'Caption Generator', icon: 'phone' },
      { href: '/dashboard/ad-copy',   label: 'Ad Copy (Meta)',    icon: 'megaphone' },
      { href: '/dashboard/content',   label: 'Content Studio',    icon: 'wand' },
      { href: '/dashboard/scheduler', label: 'Scheduler',         icon: 'cal-check' },
    ],
  },
  {
    label: 'Automate',
    links: [
      { href: '/dashboard/ai-operator',  label: 'AI Operator',     icon: 'zap' },
      { href: '/dashboard/receptionist', label: 'AI Receptionist', icon: 'headphones' },
    ],
  },
]

const PREMIUM_LINKS: Record<string, { href: string; label: string; icon: string; section: string }> = {
  'qr-generator':     { href: '/dashboard/qr-generator',     label: 'QR Generator',      icon: 'grid',         section: 'Premium' },
  'review-requests':  { href: '/dashboard/review-requests',   label: 'Review Requests',   icon: 'star',         section: 'Premium' },
  'loyalty':          { href: '/dashboard/loyalty',           label: 'Loyalty Points',    icon: 'award',        section: 'Premium' },
  'staff':            { href: '/dashboard/staff',             label: 'Staff Management',  icon: 'briefcase',    section: 'Premium' },
  'surveys':          { href: '/dashboard/surveys',           label: 'Surveys',           icon: 'list',         section: 'Premium' },
  'sms-campaigns':    { href: '/dashboard/sms-campaigns',     label: 'SMS Campaigns',     icon: 'msg-square',   section: 'Premium' },
  'waitlist':         { href: '/dashboard/waitlist',          label: 'Waitlist Manager',  icon: 'clock',        section: 'Premium' },
  'gift-cards':       { href: '/dashboard/gift-cards',        label: 'Gift Cards',        icon: 'gift',         section: 'Premium' },
  'inventory':        { href: '/dashboard/inventory',         label: 'Inventory Tracker', icon: 'box',          section: 'Premium' },
  'bundle-builder':   { href: '/dashboard/bundle-builder',    label: 'Bundle Builder',    icon: 'layers',       section: 'Premium' },
  'photo-gallery':    { href: '/dashboard/photo-gallery',     label: 'Photo Gallery',     icon: 'image',        section: 'Premium' },
  'referral-program': { href: '/dashboard/referral-program',  label: 'Referral Program',  icon: 'share-2',      section: 'Premium' },
  'tiktok-scripts':   { href: '/dashboard/tiktok-scripts',    label: 'TikTok Scripts',    icon: 'video',        section: 'Premium' },
  'payment-links':    { href: '/dashboard/payment-links',     label: 'Payment Links',     icon: 'credit-card',  section: 'Premium' },
}

export function Sidebar({ user, isAdmin }: Props) {
  const pathname = usePathname()
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/features').then(r => r.json()).then(d => setEnabledFeatures(Array.isArray(d) ? d : []))
  }, [])

  const premiumLinks = enabledFeatures.filter(slug => PREMIUM_LINKS[slug]).map(slug => PREMIUM_LINKS[slug])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function NavLink({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) {
    const active = isActive(href, exact)
    return (
      <Link href={href} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4375rem 0.75rem', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500,
        textDecoration: 'none',
        background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
        color: active ? '#c4b5fd' : 'var(--muted)',
        transition: 'background 0.12s, color 0.12s',
      }}>
        <Icon id={icon} />
        {label}
      </Link>
    )
  }

  const bottomLinks = [
    { href: '/dashboard/help',     label: 'Help & Support',  icon: 'life-buoy' },
    { href: '/dashboard/settings', label: 'Settings',        icon: 'settings' },
    ...(isAdmin ? [
      { href: '/dashboard/admin',          label: 'Admin',           icon: 'key' },
      { href: '/dashboard/admin/features', label: 'Feature Manager', icon: 'sliders' },
    ] : []),
  ]

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
          {bottomLinks.map(link => <NavLink key={link.href} {...link} />)}
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
          <Icon id="signout" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
