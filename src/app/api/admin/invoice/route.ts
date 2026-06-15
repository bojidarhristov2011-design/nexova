import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await db.user.findUnique({ where: { id: session.user.id } })
  if (!me?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await request.json()
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const isYearly = user.plan === 'yearly'
  const amount = isYearly ? 599 : 79
  const period = isYearly ? 'year' : 'month'
  const invoiceNumber = `NXV-${Date.now().toString().slice(-6)}`
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 2rem; }
  .header { background: #09090f; color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
  .logo { font-size: 1.5rem; font-weight: 900; color: #a78bfa; }
  .invoice-no { color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; }
  .section { margin-bottom: 1.5rem; }
  .label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .value { font-size: 1rem; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
  th { text-align: left; padding: 0.75rem; background: #f8fafc; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
  td { padding: 0.875rem 0.75rem; border-top: 1px solid #e2e8f0; }
  .total-row td { font-weight: 700; font-size: 1.1rem; border-top: 2px solid #7c3aed; color: #7c3aed; }
  .footer { text-align: center; color: #94a3b8; font-size: 0.8rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
</style></head>
<body>
  <div class="header">
    <div class="logo">Nexova</div>
    <div class="invoice-no">Invoice ${invoiceNumber}</div>
  </div>

  <div style="display:flex; justify-content:space-between; margin-bottom:2rem;">
    <div class="section">
      <div class="label">From</div>
      <div class="value"><strong>Nexova</strong></div>
      <div style="color:#64748b; font-size:0.9rem;">bojidarhristov2011@gmail.com</div>
    </div>
    <div class="section" style="text-align:right;">
      <div class="label">Invoice date</div>
      <div class="value">${date}</div>
      <div style="margin-top:0.75rem;">
        <div class="label">Invoice number</div>
        <div class="value">${invoiceNumber}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="label">Bill to</div>
    <div class="value">${user.name || user.email}</div>
    <div style="color:#64748b; font-size:0.9rem;">${user.email}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Nexova — ${isYearly ? 'Annual' : 'Monthly'} Plan</strong><br>
          <span style="color:#64748b; font-size:0.875rem;">Full access to all 14+ automation tools · 1 ${period}</span>
        </td>
        <td style="text-align:right; font-weight:600;">€${amount}.00</td>
      </tr>
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align:right;">€${amount}.00</td>
      </tr>
    </tbody>
  </table>

  <div style="background:#f8fafc; border-radius:10px; padding:1rem; font-size:0.875rem; color:#64748b;">
    Payment received via Revolut / Bank Transfer. Thank you for your business!
  </div>

  <div class="footer">
    Nexova · AI Business Automation · nexova-platform.netlify.app
  </div>
</body>
</html>`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  })

  await transporter.sendMail({
    from: `"Nexova" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: `Your Nexova Invoice — ${invoiceNumber}`,
    html,
  })

  return NextResponse.json({ success: true, invoiceNumber })
}
