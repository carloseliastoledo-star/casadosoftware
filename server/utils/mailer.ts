import { createError } from 'h3'
import nodemailer from 'nodemailer'

type MailParams = {
  to: string
  bcc?: string
  subject: string
  html: string
}

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST || ''
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''

  if (!host || !user || !pass) {
    throw createError({ statusCode: 500, statusMessage: 'SMTP não configurado' })
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  })

  return cachedTransporter
}

export async function sendMail({ to, bcc, subject, html }: MailParams) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || ''
  if (!from) {
    throw createError({ statusCode: 500, statusMessage: 'SMTP_FROM não configurado' })
  }

  const transporter = getTransporter()
  const safeBcc = String(bcc || '').trim()
  await transporter.sendMail({ from, to, bcc: safeBcc || undefined, subject, html })
}

export function renderLicenseEmail(params: {
  produtoNome: string
  licenseKey: string
  orderId: string
}) {
  const { produtoNome, licenseKey, orderId } = params
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Sua licença chegou</h2>
      <p style="margin: 0 0 12px;">Pagamento confirmado. Aqui está sua licença:</p>
      <p style="margin: 0 0 8px;"><strong>Produto:</strong> ${escapeHtml(produtoNome)}</p>
      <p style="margin: 0 0 8px;"><strong>Pedido:</strong> ${escapeHtml(orderId)}</p>
      <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        ${escapeHtml(licenseKey)}
      </div>
      <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">Guarde este e-mail para referência.</p>
    </div>
  `.trim()
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
