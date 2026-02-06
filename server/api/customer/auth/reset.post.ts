import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'crypto'
import { getStoreContext } from '../../../utils/store'

function hashToken(token: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export default defineEventHandler(async (event) => {
  const RESET_HANDLER_VERSION = 'reset-v3'

  try {
    const { storeSlug } = getStoreContext()
    const body = await readBody(event)

    const { default: prisma } = await import('../../../db/prisma')
    const { hashPassword } = await import('../../../utils/password')
    const { setCustomerSession } = await import('../../../utils/customerSession')

    const token = String(body?.token || '').trim()
    const password = String(body?.password || '').trim()

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

    if (!storeSlug) {
      throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
    }

    if (typeof hashPassword !== 'function') {
      throw createError({ statusCode: 500, statusMessage: 'Falha interna: hashPassword inválido' })
    }

    if (!prisma || typeof (prisma as any).customer?.findFirst !== 'function') {
      throw createError({ statusCode: 500, statusMessage: 'Falha interna: prisma.customer inválido' })
    }

    if (typeof setCustomerSession !== 'function') {
      throw createError({ statusCode: 500, statusMessage: 'Falha interna: setCustomerSession inválido' })
    }

    const tokenHash = hashToken(token, secret)
    const now = new Date()

    const customer = await (prisma as any).customer.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: now },
        storeSlug
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
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || 500)
    if (statusCode >= 400 && statusCode < 500) {
      throw err
    }

    const message = err?.statusMessage || (err?.message ? String(err.message) : String(err))
    throw createError({
      statusCode: 500,
      statusMessage: `Erro interno ao redefinir senha (${RESET_HANDLER_VERSION}): ${message}`
    })
  }
})
