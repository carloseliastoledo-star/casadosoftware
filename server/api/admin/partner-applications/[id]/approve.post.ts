import { defineEventHandler, readBody, createError } from 'h3'
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

  const body = await readBody(event)
  const refCode = String(body?.refCode || '').trim()
  const commissionRate = body?.commissionRate != null ? Number(body.commissionRate) : 0.25

  if (!refCode) throw createError({ statusCode: 400, statusMessage: 'refCode obrigatório' })
  if (!Number.isFinite(commissionRate) || commissionRate <= 0 || commissionRate > 1) {
    throw createError({ statusCode: 400, statusMessage: 'commissionRate inválido (0-1)' })
  }

  const application = await (prisma as any).partnerApplication.findUnique({
    where: { id },
    select: { id: true, name: true, email: true }
  })

  if (!application) throw createError({ statusCode: 404, statusMessage: 'Inscrição não encontrada' })

  const name = String(application.name || '').trim()
  const email = String(application.email || '').trim().toLowerCase()

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nome inválido' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })

  const affiliate = await (prisma as any).affiliate.upsert({
    where: { email },
    create: { name, email, refCode, commissionRate, isActive: false },
    update: { name, refCode, commissionRate },
    select: { id: true }
  })

  const secret = String(process.env.AFFILIATE_INVITE_SECRET || process.env.AFFILIATE_SESSION_SECRET || '').trim()
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'AFFILIATE_INVITE_SECRET não configurado' })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token, secret)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

  await (prisma as any).affiliate.update({
    where: { id: affiliate.id },
    data: {
      inviteTokenHash: tokenHash,
      inviteExpiresAt: expiresAt,
      isActive: false,
      passwordHash: null
    },
    select: { id: true }
  })

  const baseUrl = getBaseUrl(event)
  const inviteUrl = baseUrl
    ? `${baseUrl}/affiliate/ativar?token=${encodeURIComponent(token)}`
    : `/affiliate/ativar?token=${encodeURIComponent(token)}`

  return { ok: true, affiliateId: affiliate.id, inviteUrl }
})
