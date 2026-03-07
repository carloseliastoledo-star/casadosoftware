import { defineEventHandler, createError } from 'h3'
import crypto from 'crypto'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'

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
  await requireAdminSession(event)

  const id = Number((event.context.params as any)?.id)
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'id inválido' })

  const secret = String(process.env.AFFILIATE_INVITE_SECRET || process.env.AFFILIATE_SESSION_SECRET || '').trim()
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'AFFILIATE_INVITE_SECRET não configurado' })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token, secret)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

  const affiliate = await (prisma as any).affiliate.update({
    where: { id },
    data: {
      inviteTokenHash: tokenHash,
      inviteExpiresAt: expiresAt,
      isActive: false,
      passwordHash: null
    },
    select: { id: true }
  })

  const baseUrl = getBaseUrl(event)
  const inviteUrl = baseUrl ? `${baseUrl}/affiliate/ativar?token=${encodeURIComponent(token)}` : `/affiliate/ativar?token=${encodeURIComponent(token)}`

  return { ok: true, id: affiliate.id, inviteUrl }
})
