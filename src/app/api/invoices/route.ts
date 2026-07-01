import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentBusinessId } from '@/lib/currentBusiness'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const invoices = await db.invoice.findMany({
    where: { userId: session.user.id, ...(businessId ? { businessId } : {}) },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const businessId = await getCurrentBusinessId()
  const body = await request.json()
  const { clientName, clientEmail, items, tax, currency, dueDate, notes } = body

  const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
    sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (tax / 100)
  const total = subtotal + taxAmount

  const count = await db.invoice.count({ where: { userId: session.user.id } })
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`

  const invoice = await db.invoice.create({
    data: {
      userId: session.user.id,
      businessId,
      invoiceNumber,
      clientName,
      clientEmail,
      items: JSON.stringify(items),
      subtotal,
      tax: taxAmount,
      total,
      currency: currency || 'USD',
      dueDate: dueDate || null,
      notes: notes || null,
    },
  })

  return NextResponse.json(invoice)
}
