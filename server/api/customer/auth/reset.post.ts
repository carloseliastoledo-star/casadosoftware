import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'crypto'
import { getStoreContext, whereForStore } from '../../../utils/store'

function hashToken(token: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(token).digest('hex')
}

export default defineEventHandler(async (event) => {
  const RESET_HANDLER_VERSION = 'reset-v3'

  try {
    const ctx = getStoreContext()
    const body = await readBody(event)

    const { default: prisma } = await import('../../../db/prisma')
    const { hashPassword } = await import('../../../utils/password')
    const { setCustomerSession } = await import('../../../utils/customerSession')

    const token = String(body?.token || '').trim()
    const password = String(body?.password || '').trim()

    const tokenPreview = token.length >= 8 ? `${token.slice(0, 4)}...${token.slice(-4)}` : `${token}`
    const tokenFormatOk = /^[0-9a-f]{64}$/i.test(token)

    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Token inválido' })
    }

    if (!password || password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const secrets = [process.env.CUSTOMER_RESET_SECRET, process.env.CUSTOMER_SESSION_SECRET]
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)

    if (!secrets.length) {
      throw createError({ statusCode: 500, statusMessage: 'Configuração de segurança ausente' })
    }

    console.info('[customer-reset] request', {
      storeSlug: ctx.storeSlug,
      includeLegacy: ctx.includeLegacy,
      secretsCount: secrets.length,
      tokenLength: token.length,
      tokenFormatOk,
      tokenPreview
    })

    if (!ctx.storeSlug) {
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

    const tokenHashes = secrets.map((s) => hashToken(token, s))
    const now = new Date()

    const customer = await (prisma as any).customer.findFirst({
      where: whereForStore(
        {
          passwordResetTokenHash: { in: tokenHashes },
          passwordResetExpiresAt: { gt: now }
        },
        ctx
      ) as any,
      select: { id: true, email: true }
    })

    if (!customer) {
      const tokenAnyStore = await (prisma as any).customer.findFirst({
        where: {
          passwordResetTokenHash: { in: tokenHashes },
          passwordResetExpiresAt: { gt: now }
        },
        select: { storeSlug: true }
      })

      if (tokenAnyStore) {
        console.warn('[customer-reset] token encontrado em outra loja', {
          storeSlug: ctx.storeSlug,
          tokenStoreSlug: tokenAnyStore.storeSlug
        })
        const foundSlug = tokenAnyStore.storeSlug ? String(tokenAnyStore.storeSlug) : 'legacy'
        throw createError({
          statusCode: 400,
          statusMessage: `Token pertence a outra loja (STORE_SLUG atual: ${ctx.storeSlug}; token: ${foundSlug})`
        })
      }

      console.warn('[customer-reset] token não encontrado/expirado', {
        storeSlug: ctx.storeSlug
      })
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

    console.warn('[customer-reset] ok', {
      customerId: customer.id,
      storeSlug: ctx.storeSlug
    })

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
