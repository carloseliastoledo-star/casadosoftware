import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'crypto'
import prisma from '../../../db/prisma'
import { hashPassword } from '../../../utils/password'
import { setAffiliateSession } from '../../../utils/affiliateSession'

function hashToken(token: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = String(body?.token || '').trim()
  const password = String(body?.password || '').trim()

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token inválido' })
  }

  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 6 caracteres' })
  }

  const secrets = [process.env.AFFILIATE_INVITE_SECRET, process.env.AFFILIATE_SESSION_SECRET]
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)

  if (!secrets.length) {
    throw createError({ statusCode: 500, statusMessage: 'Configuração de segurança ausente' })
  }

  const tokenHashes = secrets.map((s) => hashToken(token, s))
  const now = new Date()

  const affiliate = await (prisma as any).affiliate.findFirst({
    where: {
      inviteTokenHash: { in: tokenHashes },
      inviteExpiresAt: { gt: now }
    },
    select: { id: true, email: true, isActive: true }
  })

  if (!affiliate) {
    throw createError({ statusCode: 400, statusMessage: 'Token inválido ou expirado' })
  }

  const passwordHash = hashPassword(password)

  await (prisma as any).affiliate.update({
    where: { id: affiliate.id },
    data: {
      passwordHash,
      inviteTokenHash: null,
      inviteExpiresAt: null,
      isActive: true
    },
    select: { id: true }
  })

  setAffiliateSession(event, { affiliateId: affiliate.id, email: affiliate.email })

  return { ok: true }
})
