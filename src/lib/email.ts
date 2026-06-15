import nodemailer from 'nodemailer'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceEmailData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  currency: string
  dueDate?: string | null
  notes?: string | null
  senderName: string
  senderEmail: string
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function buildInvoiceHtml(data: InvoiceEmailData): string {
  const fmt = (n: number) => formatCurrency(n, data.currency)
  const rows = data.items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;">${item.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">${fmt(item.unitPrice)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${fmt(item.quantity * item.unitPrice)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice ${data.invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h1 style="margin:0 0 4px;font-size:28px;font-weight:800;letter-spacing:-0.04em;">INVOICE</h1>
          <p style="margin:0;opacity:0.85;font-size:15px;">#${data.invoiceNumber}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:20px;font-weight:700;">${data.senderName}</p>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">${data.senderEmail}</p>
        </div>
      </div>
    </div>

    <div style="padding:32px 40px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
        <div>
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Bill To</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:#111827;">${data.clientName}</p>
          <p style="margin:2px 0 0;color:#6b7280;font-size:14px;">${data.clientEmail}</p>
        </div>
        ${data.dueDate ? `<div style="text-align:right;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Due Date</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${data.dueDate}</p>
        </div>` : ''}
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;">
        <div style="min-width:240px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#374151;">
            <span>Subtotal</span><span>${fmt(data.subtotal)}</span>
          </div>
          ${data.tax > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#374151;">
            <span>Tax</span><span>${fmt(data.tax)}</span>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:12px 0 6px;font-size:18px;font-weight:700;color:#111827;border-top:2px solid #111827;margin-top:4px;">
            <span>Total</span><span>${fmt(data.total)}</span>
          </div>
        </div>
      </div>

      ${data.notes ? `<div style="margin-top:32px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #7c3aed;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Notes</p>
        <p style="margin:0;font-size:14px;color:#374151;white-space:pre-line;">${data.notes}</p>
      </div>` : ''}
    </div>

    <div style="padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:13px;color:#9ca3af;">Thank you for your business!</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"${data.senderName}" <${process.env.EMAIL_FROM}>`,
    to: data.clientEmail,
    subject: `Invoice #${data.invoiceNumber} from ${data.senderName}`,
    html: buildInvoiceHtml(data),
  })
}
