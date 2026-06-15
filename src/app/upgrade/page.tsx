import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { NexovaLogo } from '@/components/NexovaLogo'

const REVOLUT_TAG = '@bojidarhristov' // your Revolut tag
const CONTACT_EMAIL = 'bojidarhristov2011@gmail.com'

export default async function UpgradePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, isAdmin: true },
  })

  if (dbUser?.isAdmin || (dbUser?.plan && dbUser.plan !== 'free')) {
    redirect('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090f', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
        <NexovaLogo size={28} />
        <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nexova
        </span>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 560, marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
          YOUR FREE TRIAL HAS ENDED
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 1rem' }}>
          Choose a plan to continue
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
          Your 3-day free trial has expired. Pick a plan, pay via Revolut or bank transfer, and your account will be activated within a few hours.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', width: '100%', maxWidth: 700, marginBottom: '2rem' }}>

        {/* Monthly */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1.25rem' }}>Monthly</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>€79</span>
            <span style={{ color: '#475569', fontSize: '0.9rem' }}>/month</span>
          </div>
          <p style={{ color: '#334155', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>Billed monthly · Cancel any time</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['All 14+ automation tools', 'Unlimited AI generations', 'CRM, Invoices, Calendar', 'Email, Proposals, Contracts', 'LinkedIn & Cold Email tools'].map(item => (
              <li key={item} style={{ display: 'flex', gap: 8, color: '#64748b', fontSize: '0.875rem' }}>
                <span style={{ color: '#7c3aed', flexShrink: 0 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Nexova Monthly - ${session.user.email}&body=Hi, I want the Monthly plan (€79/month). My Nexova account email is: ${session.user.email}%0A%0AI will send the payment via Revolut or bank transfer.`}
            style={{ display: 'block', textAlign: 'center', background: 'rgba(124,58,237,0.12)', color: '#a78bfa', textDecoration: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(124,58,237,0.2)' }}
          >
            Choose Monthly — €79/mo
          </a>
        </div>

        {/* Yearly */}
        <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            BEST VALUE
          </div>
          <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1.25rem' }}>Yearly</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>€599</span>
            <span style={{ color: '#475569', fontSize: '0.9rem' }}>/year</span>
          </div>
          <p style={{ color: '#334155', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>One payment · Save €349 vs monthly</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['Everything in Monthly', 'Priority support', 'Early access to new features', 'Onboarding call included', "Lock in today's price forever"].map(item => (
              <li key={item} style={{ display: 'flex', gap: 8, color: '#64748b', fontSize: '0.875rem' }}>
                <span style={{ color: '#a78bfa', flexShrink: 0 }}>✓</span> {item}
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Nexova Yearly - ${session.user.email}&body=Hi, I want the Yearly plan (€599/year). My Nexova account email is: ${session.user.email}%0A%0AI will send the payment via Revolut or bank transfer.`}
            style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          >
            Choose Yearly — €599/yr
          </a>
        </div>
      </div>

      {/* Payment instructions */}
      <div style={{ width: '100%', maxWidth: 700, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 1rem' }}>How to pay</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a78bfa', margin: '0 0 0.375rem' }}>Revolut</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Send to <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{REVOLUT_TAG}</span></p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a78bfa', margin: '0 0 0.375rem' }}>Bank transfer</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Email us and we'll send our bank details</p>
          </div>
        </div>
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.07)', borderRadius: 10, fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>
          After payment, email <span style={{ color: '#a78bfa' }}>{CONTACT_EMAIL}</span> with your account email and payment screenshot — we'll activate your account within a few hours and send you an invoice.
        </div>
      </div>

      <Link href="/login" style={{ color: '#334155', fontSize: '0.8rem', textDecoration: 'none' }}>
        ← Sign in with a different account
      </Link>
    </div>
  )
}
