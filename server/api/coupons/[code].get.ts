import { defineEventHandler, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { validateCoupon } from '#root/server/utils/coupon'

export default defineEventHandler(async (event) => {
  const code = String(getRouterParam(event, 'code') || '').trim()

  console.log('[COUPON API] Code received:', JSON.stringify(code))

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Código do cupom obrigatório' })
  }

  const { coupon } = await validateCoupon(code)

  console.log('[COUPON API] Validation result:', JSON.stringify(coupon))

  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
  }

  return { ok: true, coupon }
})
