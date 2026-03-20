/**
 * POST /api/upsell — cobrança 1-click usando cartão do pedido original
 * Body: { parentOrderId, upsellProductId, cardToken?, stripeCustomerId?, stripePaymentMethodId? }
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { createUpsellOrder } from '#root/server/services/upsell'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parentOrderId       = String(body?.parentOrderId       || '').trim()
  const upsellProductId     = String(body?.upsellProductId     || '').trim()
  const cardToken           = body?.cardToken           ? String(body.cardToken).trim()           : undefined
  const stripeCustomerId    = body?.stripeCustomerId    ? String(body.stripeCustomerId).trim()    : undefined
  const stripePaymentMethodId = body?.stripePaymentMethodId ? String(body.stripePaymentMethodId).trim() : undefined

  if (!parentOrderId)   throw createError({ statusCode: 400, statusMessage: 'parentOrderId obrigatório' })
  if (!upsellProductId) throw createError({ statusCode: 400, statusMessage: 'upsellProductId obrigatório' })
  if (!cardToken && !(stripeCustomerId && stripePaymentMethodId)) {
    throw createError({ statusCode: 400, statusMessage: 'cardToken ou stripeCustomerId+stripePaymentMethodId obrigatórios' })
  }

  const result = await createUpsellOrder({
    event,
    parentOrderId,
    upsellProductId,
    cardToken,
    stripeCustomerId,
    stripePaymentMethodId,
  })

  return { ok: true, ...result }
})
