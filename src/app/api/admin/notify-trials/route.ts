import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await db.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()

  // Find free users whose trial has ended and are not blocked
  const overdue = await db.user.findMany({
    where: {
      plan: 'free',
      isAdmin: false,
      blocked: false,
      trialEndsAt: { lt: now },
    },
    select: { email: true, name: true, trialEndsAt: true },
  })

  if (overdue.length === 0) return NextResponse.json({ sent: 0 })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  })

  const rows = overdue.map(u => {
    const daysOverdue = Math.floor((now.getTime() - new Date(u.trialEndsAt!).getTime()) / 86400000)
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${u.name || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${u.email}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:${daysOverdue >= 1 ? '#ef4444' : '#f59e0b'};font-weight:600;">${daysOverdue === 0 ? 'Today' : `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago`}</td>
    </tr>`
  }).join('')

  await transporter.sendMail({
    from: `"Nexova" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_FROM,
    subject: `⚠️ ${overdue.length} Nexova trial${overdue.length > 1 ? 's' : ''} expired — action needed`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
        <h2 style="color:#7c3aed;margin-top:0;">Nexova — Trial Expiry Alert</h2>
        <p style="color:#475569;">The following users are on the free plan with an expired trial. Contact them to arrange payment or block their access from the admin panel.</p>
        <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:0.8rem;color:#64748b;">Name</th>
              <th style="padding:8px 12px;text-align:left;font-size:0.8rem;color:#64748b;">Email</th>
              <th style="padding:8px 12px;text-align:left;font-size:0.8rem;color:#64748b;">Trial ended</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="https://nexova-platform.netlify.app/dashboard/admin" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">Open Admin Panel →</a>
      </div>`,
  })

  return NextResponse.json({ sent: overdue.length })
}
