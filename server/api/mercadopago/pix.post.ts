import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = body?.nome ? String(body.nome).trim() : undefined
  const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : undefined
  const cpf = body?.cpf ? String(body.cpf).trim() : undefined
  const couponCode = body?.couponCode ? String(body.couponCode) : ''

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  }

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
  if (!produto) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  }

  const round2 = (n: number) => Math.round(n * 100) / 100

  const { customer, order, coupon } = await prisma.$transaction(async (tx) => {
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
    const pixDiscountPercent = 5
    const pixDiscountAmount = round2(subtotalAmount * 0.05)
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

    return { customer, order, coupon }
  })

  const payment = getMpPayment()

  const transactionAmount = Number(order.totalAmount ?? Number(produto.preco))

  const result = await payment.create({
    body: {
      transaction_amount: transactionAmount,
      description: produto.nome,
      payment_method_id: 'pix',
      payer: {
        email
      },
      metadata: {
        orderId: order.id,
        produtoId: produto.id,
        nome,
        whatsapp,
        cpf,
        pixDiscountPercent: 5,
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

  await prisma.order.update({
    where: { id: order.id },
    data: { mercadoPagoPaymentId: mpPaymentId }
  })

  const qrCode = (result as any)?.point_of_interaction?.transaction_data?.qr_code
  const qrCodeBase64 = (result as any)?.point_of_interaction?.transaction_data?.qr_code_base64

  return {
    ok: true,
    orderId: order.id,
    paymentId: mpPaymentId,
    qrCode,
    qrCodeBase64: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null
  }
})
