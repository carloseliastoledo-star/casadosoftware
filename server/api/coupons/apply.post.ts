import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { validateCoupon } from '#root/server/utils/coupon'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const paymentMethod = String(body?.paymentMethod || '') as 'pix' | 'card'
  const code = String(body?.code || '')

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  }

  if (paymentMethod !== 'pix' && paymentMethod !== 'card') {
    throw createError({ statusCode: 400, statusMessage: 'paymentMethod inválido' })
  }

  const produto = await prisma.produto.findUnique({
    where: { id: produtoId },
    select: { id: true, preco: true }
  })

  if (!produto) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  }

  const subtotalAmount = round2(Number(produto.preco))

  const pixDiscountPercent = paymentMethod === 'pix' ? 5 : 0
  const pixDiscountAmount = paymentMethod === 'pix' ? round2(subtotalAmount * 0.05) : 0

  const { coupon } = await validateCoupon(code)
  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
  }

  const couponDiscountAmount = round2(subtotalAmount * (coupon.percent / 100))

  const totalAmount = Math.max(0, round2(subtotalAmount - pixDiscountAmount - couponDiscountAmount))

  return {
    ok: true,
    subtotalAmount,
    pixDiscountPercent,
    pixDiscountAmount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      percent: coupon.percent
    },
    couponDiscountAmount,
    totalAmount
  }
})
