import { defineEventHandler, readBody } from 'h3'
import crypto from 'crypto'
import prisma from '../../../db/prisma.js'
import { sendMail } from '../../../utils/mailer.js'

function hashToken(token: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

function getBaseUrl(event: any) {
  const explicit = (process.env.SITE_URL || process.env.APP_URL || '').trim().replace(/\/+$/, '')
  if (explicit) return explicit

  const headers = event?.node?.req?.headers || {}
  const proto = String(headers['x-forwarded-proto'] || 'http').split(',')[0].trim()
  const host = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim()
  if (!host) return ''
  return `${proto}://${host}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: true }
  }

  const customer = await prisma.customer.findUnique({ where: { email }, select: { id: true, email: true } })
  if (!customer) {
    return { ok: true }
  }

  const secret = process.env.CUSTOMER_RESET_SECRET || process.env.CUSTOMER_SESSION_SECRET || ''
  if (!secret) {
    return { ok: true }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token, secret)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  await (prisma as any).customer.update({
    where: { id: customer.id },
    data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt }
  })

  const baseUrl = getBaseUrl(event)
  const resetUrl = baseUrl ? `${baseUrl}/minha-conta/reset?token=${encodeURIComponent(token)}` : ''

  if (resetUrl) {
    await sendMail({
      to: customer.email,
      subject: 'Redefinir senha',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin: 0 0 12px;">Redefinir senha</h2>
          <p style="margin: 0 0 12px;">Clique no link abaixo para criar/redefinir sua senha. Este link expira em 30 minutos.</p>
          <p style="margin: 0 0 12px;"><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `.trim()
    })
  }

  return { ok: true }
})
