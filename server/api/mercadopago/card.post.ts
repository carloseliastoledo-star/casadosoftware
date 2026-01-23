import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const email = String(body?.email || '').trim().toLowerCase()

  const couponCode = body?.couponCode ? String(body.couponCode) : ''

  const token = String(body?.token || '')
  const paymentMethodId = String(body?.payment_method_id || '')
  const issuerId = body?.issuer_id ? String(body.issuer_id) : undefined
  const installments = Number(body?.installments || 1)

  const identificationType = String(body?.identification?.type || 'CPF')
  const identificationNumber = String(body?.identification?.number || '')

  if (!produtoId) throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })

  if (!token) throw createError({ statusCode: 400, statusMessage: 'token obrigatório' })
  if (!paymentMethodId) throw createError({ statusCode: 400, statusMessage: 'payment_method_id obrigatório' })
  if (!identificationNumber) throw createError({ statusCode: 400, statusMessage: 'CPF obrigatório' })

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const round2 = (n: number) => Math.round(n * 100) / 100

  const { order, coupon } = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      create: { email },
      update: {}
    })

    let coupon: { id: string; code: string; percent: number } | null = null
    const normalizedCode = String(couponCode || '').trim().toUpperCase()
    if (normalizedCode) {
      const c = await tx.cupom.findUnique({
        where: { code: normalizedCode },
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

      if (!c) throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
      if (!c.active) throw createError({ statusCode: 400, statusMessage: 'Cupom inativo' })
      const now = new Date()
      if (c.startsAt && c.startsAt > now) throw createError({ statusCode: 400, statusMessage: 'Cupom ainda não está válido' })
      if (c.expiresAt && c.expiresAt < now) throw createError({ statusCode: 400, statusMessage: 'Cupom expirado' })
      if (c.maxUses !== null && c.maxUses !== undefined && c.usedCount >= c.maxUses) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom esgotado' })
      }
      const percent = Number(c.percent)
      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom inválido' })
      }

      coupon = { id: c.id, code: c.code, percent }
    }

    const subtotalAmount = round2(Number(produto.preco))
    const pixDiscountPercent = 0
    const pixDiscountAmount = 0
    const couponDiscountAmount = coupon ? round2(subtotalAmount * (coupon.percent / 100)) : 0
    const totalAmount = Math.max(0, round2(subtotalAmount - pixDiscountAmount - couponDiscountAmount))

    if (coupon) {
      await tx.cupom.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      })
    }

    const order = await tx.order.create({
      data: {
        status: 'PENDING',
        produtoId: produto.id,
        customerId: customer.id,
        cupomId: coupon?.id || null,
        subtotalAmount,
        pixDiscountPercent,
        pixDiscountAmount,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null,
        couponDiscountAmount: coupon ? couponDiscountAmount : null,
        totalAmount
      }
    })

    return { order, coupon }
  })

  const payment = getMpPayment()

  const transactionAmount = Number(order.totalAmount ?? Number(produto.preco))

  const result = await payment.create({
    body: {
      transaction_amount: transactionAmount,
      description: produto.nome,
      token,
      installments,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email,
        identification: {
          type: identificationType,
          number: identificationNumber
        }
      },
      metadata: {
        orderId: order.id,
        produtoId: produto.id,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null
      },
      external_reference: order.id
    }
  })

  const mpPaymentId = String((result as any)?.id || '')
  if (!mpPaymentId) {
    throw createError({ statusCode: 502, statusMessage: 'Falha ao criar pagamento no Mercado Pago' })
  }

  const status = String((result as any)?.status || '').toLowerCase()

  await prisma.order.update({
    where: { id: order.id },
    data: {
      mercadoPagoPaymentId: mpPaymentId,
      status: status === 'approved' ? 'PAID' : 'PENDING',
      pagoEm: status === 'approved' ? new Date() : null
    }
  })

  return {
    ok: true,
    orderId: order.id,
    paymentId: mpPaymentId,
    status
  }
})
