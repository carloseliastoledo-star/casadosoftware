import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const email = String(body?.email || '').trim().toLowerCase()

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

  const customer = await prisma.customer.upsert({
    where: { email },
    create: { email },
    update: {}
  })

  const order = await prisma.order.create({
    data: {
      status: 'PENDING',
      produtoId: produto.id,
      customerId: customer.id
    }
  })

  const payment = getMpPayment()

  const result = await payment.create({
    body: {
      transaction_amount: Number(produto.preco),
      description: produto.nome,
      payment_method_id: 'pix',
      payer: {
        email
      },
      metadata: {
        orderId: order.id,
        produtoId: produto.id
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
