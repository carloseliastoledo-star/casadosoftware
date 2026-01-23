import { createError } from 'h3'
import prisma from '#root/server/db/prisma'

export type CouponValidationResult = {
  coupon: {
    id: string
    code: string
    percent: number
  } | null
}

export function normalizeCouponCode(code: string) {
  return String(code || '').trim().toUpperCase()
}

export async function validateCoupon(codeRaw: string) {
  const code = normalizeCouponCode(codeRaw)
  if (!code) return { coupon: null } satisfies CouponValidationResult

  const coupon = await prisma.cupom.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      percent: true,
      active: true,
      startsAt: true,
      expiresAt: true,
      maxUses: true,
      usedCount: true
    }
  })

  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
  }

  if (!coupon.active) {
    throw createError({ statusCode: 400, statusMessage: 'Cupom inativo' })
  }

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) {
    throw createError({ statusCode: 400, statusMessage: 'Cupom ainda não está válido' })
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw createError({ statusCode: 400, statusMessage: 'Cupom expirado' })
  }

  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    throw createError({ statusCode: 400, statusMessage: 'Cupom esgotado' })
  }

  const percent = Number(coupon.percent)
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Cupom inválido' })
  }

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      percent
    }
  } satisfies CouponValidationResult
}
