import { defineEventHandler, readBody } from 'h3'
import crypto from 'crypto'
import prisma from '../../../db/prisma'
import { sendMail } from '../../../utils/mailer'
import { getStoreContext, whereForStore } from '../../../utils/store'

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
  const ctx = getStoreContext()
  const body = await readBody(event)

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: true }
  }

  if (!ctx.storeSlug) {
    console.warn('[customer-forgot] storeSlug ausente', { email })
    return { ok: true }
  }

  console.info('[customer-forgot] request', {
    email,
    storeSlug: ctx.storeSlug,
    includeLegacy: ctx.includeLegacy
  })

  const customer = await prisma.customer.findFirst({
    where: whereForStore({ email }, ctx) as any,
    select: { id: true, email: true }
  })
  if (!customer) {
    console.warn('[customer-forgot] customer não encontrado', {
      email,
      storeSlug: ctx.storeSlug,
      includeLegacy: ctx.includeLegacy
    })
    return { ok: true }
  }

  const secret = process.env.CUSTOMER_RESET_SECRET || process.env.CUSTOMER_SESSION_SECRET || ''
  if (!secret) {
    console.error('[customer-forgot] secret ausente', {
      email,
      storeSlug: ctx.storeSlug
    })
    return { ok: true }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token, secret)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  await (prisma as any).customer.update({
    where: { id: customer.id },
    data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt }
  })

  console.info('[customer-forgot] token gravado', {
    customerId: customer.id,
    storeSlug: ctx.storeSlug,
    expiresAt: expiresAt.toISOString()
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
