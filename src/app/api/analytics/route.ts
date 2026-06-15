import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id

  const [
    totalContacts,
    leads,
    customers,
    totalInvoices,
    paidInvoices,
    sentInvoices,
    revenueResult,
    totalAgents,
    scheduledPosts,
    sentPosts,
  ] = await Promise.all([
    db.contact.count({ where: { userId: uid } }),
    db.contact.count({ where: { userId: uid, status: 'lead' } }),
    db.contact.count({ where: { userId: uid, status: 'customer' } }),
    db.invoice.count({ where: { userId: uid } }),
    db.invoice.count({ where: { userId: uid, status: 'paid' } }),
    db.invoice.count({ where: { userId: uid, status: 'sent' } }),
    db.invoice.aggregate({ where: { userId: uid, status: 'paid' }, _sum: { total: true } }),
    db.agent.count({ where: { userId: uid } }),
    db.scheduledPost.count({ where: { userId: uid, status: 'pending' } }),
    db.scheduledPost.count({ where: { userId: uid, status: 'sent' } }),
  ])

  return NextResponse.json({
    contacts: { total: totalContacts, leads, customers },
    invoices: { total: totalInvoices, paid: paidInvoices, sent: sentInvoices, revenue: revenueResult._sum.total ?? 0 },
    agents: totalAgents,
    posts: { scheduled: scheduledPosts, sent: sentPosts },
  })
}
