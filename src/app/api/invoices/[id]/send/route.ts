import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendInvoiceEmail, InvoiceItem } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invoice = await db.invoice.findFirst({ where: { id, userId: session.user.id } })
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const emailFrom = process.env.EMAIL_FROM
  const emailPass = process.env.EMAIL_PASSWORD

  if (!emailFrom || emailFrom === 'your-gmail@gmail.com' || !emailPass || emailPass === 'your-gmail-app-password') {
    return NextResponse.json({ error: 'Email not set up yet. Open .env and replace EMAIL_FROM and EMAIL_PASSWORD with your Gmail and App Password.' }, { status: 400 })
  }

  const items = JSON.parse(invoice.items) as InvoiceItem[]

  try {
    await sendInvoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      senderName: session.user.name || session.user.email || 'Nexova',
      senderEmail: emailFrom,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send email'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  await db.invoice.update({ where: { id }, data: { status: 'sent' } })

  return NextResponse.json({ success: true })
}
