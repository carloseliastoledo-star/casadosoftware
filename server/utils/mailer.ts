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

  const passPreview = pass.length > 6 ? `${pass.slice(0, 4)}...${pass.slice(-4)} (len=${pass.length})` : `(len=${pass.length})`
  console.log(`[mailer] Creating SMTP transporter: host=${host}, port=${port}, user=${user}, pass=${passPreview}`)

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
  const rawFrom = process.env.SMTP_FROM || process.env.SMTP_USER || ''
  if (!rawFrom) {
    throw createError({ statusCode: 500, statusMessage: 'SMTP_FROM não configurado' })
  }

  // Adicionar nome de exibição se não tiver (melhora entregabilidade)
  const from = rawFrom.includes('<') ? rawFrom : `Casa do Software <${rawFrom}>`

  const transporter = getTransporter()
  const safeBcc = String(bcc || '').trim()

  console.log(`[mailer] Enviando email: from=${from}, to=${to}, subject=${subject}`)

  const info = await transporter.sendMail({ from, to, bcc: safeBcc || undefined, subject, html })

  console.log(`[mailer] Resultado envio:`, {
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted,
    rejected: info.rejected,
    envelope: info.envelope
  })

  // Verificar se o destinatário foi rejeitado
  const rejected = Array.isArray(info.rejected) ? info.rejected : []
  if (rejected.length > 0) {
    throw new Error(`Email rejeitado pelo servidor SMTP para: ${rejected.join(', ')}. Response: ${info.response}`)
  }
}

export function renderLicenseEmail(params: {
  produtoNome: string
  licenseKey: string
  orderId: string
}) {
  const { produtoNome, licenseKey, orderId } = params
  const siteUrl = String(process.env.SITE_URL || 'https://casadosoftware.com.br').replace(/\/$/, '')
  const siteName = 'Casa do Software'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua licença - ${escapeHtml(siteName)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">${escapeHtml(siteName)}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px;">&#127881; Sua licença chegou!</h2>
              <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
                Pagamento confirmado. Aqui estão os dados da sua licença:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #f3f4f6;">Produto</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f3f4f6;">${escapeHtml(produtoNome)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #f3f4f6;">Pedido</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; border-bottom: 1px solid #f3f4f6;">${escapeHtml(orderId)}</td>
                </tr>
              </table>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 0 0 20px;">
                <p style="margin: 0 0 6px; color: #15803d; font-size: 12px; font-weight: 600; text-transform: uppercase;">Sua Licença</p>
                <p style="margin: 0; color: #111827; font-size: 15px; font-family: 'Courier New', Courier, monospace; word-break: break-all; line-height: 1.6;">${escapeHtml(licenseKey)}</p>
              </div>
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                &#128274; Guarde este e-mail em local seguro para referência futura.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                Se precisar de ajuda, entre em contato pelo nosso WhatsApp.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                ${escapeHtml(siteName)} &mdash; <a href="${siteUrl}" style="color: #6b7280;">${siteUrl.replace('https://', '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
