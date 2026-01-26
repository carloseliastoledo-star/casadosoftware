import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'crypto'
import prisma from '../../../db/prisma.js'
import { hashPassword } from '../../../utils/password.js'
import { setCustomerSession } from '../../../utils/customerSession.js'

function hashToken(token: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = String(body?.token || '')
  const password = String(body?.password || '')

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token inválido' })
  }

  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 6 caracteres' })
  }

  const secret = process.env.CUSTOMER_RESET_SECRET || process.env.CUSTOMER_SESSION_SECRET || ''
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'Configuração de segurança ausente' })
  }

  const tokenHash = hashToken(token, secret)
  const now = new Date()

  const customer = await (prisma as any).customer.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: now }
    },
    select: { id: true, email: true }
  })

  if (!customer) {
    throw createError({ statusCode: 400, statusMessage: 'Token inválido ou expirado' })
  }

  const passwordHash = hashPassword(password)

  await (prisma as any).customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null
    }
  })

  setCustomerSession(event, { customerId: customer.id, email: customer.email })

  return { ok: true }
})
