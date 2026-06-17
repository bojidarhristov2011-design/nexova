import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NexovaLogo } from '@/components/NexovaLogo'

const FEATURES = [
  { icon: '🤖', title: 'AI Chatbots',           desc: 'Custom agents trained on your business. Embed on any website.' },
  { icon: '👥', title: 'CRM',                    desc: 'Track every lead and customer. Know exactly who to follow up with.' },
  { icon: '🧾', title: 'Invoices',               desc: 'Create and email professional invoices in seconds. Get paid faster.' },
  { icon: '💰', title: 'Quote Generator',        desc: 'Send professional price quotes before the job starts. Win more clients.' },
  { icon: '📆', title: 'Calendar & Tasks',       desc: 'Schedule meetings, deadlines, and reminders. Never miss a thing.' },
  { icon: '📋', title: 'AI Meeting Notes',       desc: 'Paste any transcript — get summary, decisions, and action items instantly.' },
  { icon: '🚀', title: 'Client Onboarding',      desc: 'Generate a full onboarding plan, welcome message, and checklist for every new client.' },
  { icon: '✉️', title: 'Email Writer',           desc: 'AI writes your sales emails, follow-ups, and cold outreach — and sends them.' },
  { icon: '📄', title: 'Proposals',              desc: 'Turn a client brief into a full professional proposal and send it instantly.' },
  { icon: '📝', title: 'Contract Generator',     desc: 'Generate professional contracts ready to sign in seconds.' },
  { icon: '🪪', title: 'Business Bio Writer',    desc: 'Get 3 versions of your About Us — social bio, website header, and full page.' },
  { icon: '❓', title: 'FAQ Generator',          desc: 'Generate 10 ready-to-publish FAQs for your website or landing page.' },
  { icon: '⚖️', title: 'Legal Docs',            desc: 'Privacy Policy and Terms & Conditions generated in seconds. Stay compliant.' },
  { icon: '✍️', title: 'Blog & SEO Writer',     desc: 'Full blog posts optimised for Google. Generated in seconds.' },
  { icon: '⭐', title: 'Review Responder',       desc: 'AI replies to your Google, Facebook, Trustpilot reviews instantly.' },
  { icon: '💬', title: 'WhatsApp Messages',      desc: 'Follow-ups, promos, reminders — ready to send in one click.' },
  { icon: '🔔', title: 'Appointment Reminders',  desc: '3 reminder messages per client — 24h before, day of, and no-show follow-up.' },
  { icon: '🔗', title: 'LinkedIn Outreach',      desc: 'AI-written LinkedIn messages that get replies. Connection requests to sales.' },
  { icon: '📨', title: 'Cold Email Sequences',   desc: '3-email follow-up series written by AI. Day 1, 3, and 7 — done.' },
  { icon: '📱', title: 'Caption Generator',      desc: '3 scroll-stopping captions with hashtags for Instagram, TikTok, or LinkedIn.' },
  { icon: '✨', title: 'Content Studio',         desc: 'Telegram posts and TikTok scripts for your business every day.' },
  { icon: '📅', title: 'Post Scheduler',         desc: 'Schedule posts once and they publish automatically.' },
]

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#09090f', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(9,9,15,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <NexovaLogo size={26} />
            <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Nexova
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, padding: '0.4rem 0.875rem' }}>
              Log in
            </Link>
            <Link href="/signup" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '0.45rem 1.1rem', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}>
              Start Automating
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '7rem 2rem 5rem', textAlign: 'center', position: 'relative' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 999, padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.05em', marginBottom: '2rem' }}>
            3-DAY FREE TRIAL · NO CARD REQUIRED
          </div>

          <h1 style={{ fontSize: 'clamp(2.75rem, 7vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#fff', margin: '0 0 1.5rem' }}>
            Automate the work.<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Keep the momentum.
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 3rem' }}>
            Nexova replaces 10 separate tools with one dashboard — AI chatbots, CRM, invoices, emails, proposals, content, and more. Built for businesses that move fast.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link href="/signup" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', textDecoration: 'none', borderRadius: 12, padding: '1rem 2.5rem', fontSize: '1.0625rem', fontWeight: 700, boxShadow: '0 8px 28px rgba(124,58,237,0.45)', letterSpacing: '-0.01em' }}>
              Start Automating →
            </Link>
            <Link href="/login" style={{ color: '#475569', textDecoration: 'none', borderRadius: 12, padding: '1rem 1.75rem', fontSize: '1rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.07)' }}>
              Already a member
            </Link>
          </div>
          <p style={{ color: '#334155', fontSize: '0.8125rem', margin: 0 }}>3 days free, then €79/month or €599/year</p>
        </div>
      </section>

      {/* Stats strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2rem', marginBottom: '1px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '1rem' }}>
          {[
            { num: '22+', label: 'Automation tools' },
            { num: '3 days', label: 'Free trial, no card' },
            { num: '< 5 min', label: 'Setup time' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Everything in one place</h2>
          <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Stop paying for 10 different tools</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '1.625rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 0.375rem' }}>{f.title}</h3>
              <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '2rem 2rem 6rem', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>One price. Everything included.</h2>
          <p style={{ color: '#475569', fontSize: '1rem', margin: 0 }}>Start free for 3 days. No credit card needed.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Monthly */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '2rem' }}>
            <p style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1.25rem' }}>Monthly</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>€79</span>
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>/month</span>
            </div>
            <p style={{ color: '#334155', fontSize: '0.8rem', margin: '0 0 2rem' }}>Cancel any time</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['All 22+ automation tools', 'Unlimited AI generations', 'Unlimited contacts & invoices', 'AI chatbots with embed code', 'Email support'].map(item => (
                <li key={item} style={{ display: 'flex', gap: 8, color: '#64748b', fontSize: '0.875rem' }}>
                  <span style={{ color: '#7c3aed', flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: 'rgba(124,58,237,0.12)', color: '#a78bfa', textDecoration: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(124,58,237,0.2)' }}>
              Start free trial
            </Link>
          </div>

          {/* Yearly — highlighted */}
          <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.28)', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              BEST VALUE
            </div>
            <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 1.25rem' }}>Yearly</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>€599</span>
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>/year</span>
            </div>
            <p style={{ color: '#334155', fontSize: '0.8rem', margin: '0 0 2rem' }}>€49.92/month — save €349 vs monthly</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['Everything in Monthly', 'Priority support', 'Early access to new features', 'Onboarding call included', 'Lock in today\'s price forever'].map(item => (
                <li key={item} style={{ display: 'flex', gap: 8, color: '#64748b', fontSize: '0.875rem' }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
              Start free trial
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          After your 3-day trial, choose a plan. Cancel any time — no questions asked.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NexovaLogo size={20} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>Nexova</span>
        </div>
        <p style={{ color: '#1e293b', fontSize: '0.8rem', margin: 0 }}>© 2026 Nexova · AI Business Automation</p>
      </footer>
    </div>
  )
}
