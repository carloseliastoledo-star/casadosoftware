import { createError, defineEventHandler, getQuery } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { normalizeCouponCode } from '#root/server/utils/coupon'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)

  const code = normalizeCouponCode(String(query?.code || ''))
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'code obrigatório' })
  }

  const fromRaw = query?.from ? String(query.from) : ''
  const toRaw = query?.to ? String(query.to) : ''

  const from = fromRaw ? new Date(fromRaw) : null
  const to = toRaw ? new Date(toRaw) : null

  if (fromRaw && Number.isNaN(Number(from))) {
    throw createError({ statusCode: 400, statusMessage: 'from inválido' })
  }

  if (toRaw && Number.isNaN(Number(to))) {
    throw createError({ statusCode: 400, statusMessage: 'to inválido' })
  }

  const where: any = {
    status: 'PAID',
    couponCode: code
  }

  if (from || to) {
    where.pagoEm = {}
    if (from) where.pagoEm.gte = from
    if (to) where.pagoEm.lte = to
  }

  const [count, sums] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: {
        subtotalAmount: true,
        couponDiscountAmount: true,
        totalAmount: true
      }
    })
  ])

  return {
    ok: true,
    code,
    from: from ? from.toISOString() : null,
    to: to ? to.toISOString() : null,
    count,
    sums: {
      subtotalAmount: sums._sum.subtotalAmount ?? 0,
      couponDiscountAmount: sums._sum.couponDiscountAmount ?? 0,
      totalAmount: sums._sum.totalAmount ?? 0
    }
  }
})
