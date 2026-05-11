import { defineEventHandler, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'
import { getMpPayment } from '../../../../utils/mercadopago'
import { processMercadoPagoPayment } from '../../../../utils/mercadopagoWebhook'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = String((event.context.params as any)?.id || '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      mercadoPagoPaymentId: true,
      mercadoPagoPaymentTypeId: true,
      mercadoPagoPaymentMethodId: true,
      pagoEm: true
    }
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  const mpPaymentId = String(order.mercadoPagoPaymentId || '').trim()
  if (!mpPaymentId) throw createError({ statusCode: 400, statusMessage: 'Pedido não tem pagamento Mercado Pago associado' })

  try {
    const payment = getMpPayment()
    const mpPayment = await payment.get({ id: mpPaymentId })
    const mpStatus = String((mpPayment as any)?.status || '').toLowerCase()

    const paidAt = new Date()
    const paymentTypeId = (mpPayment as any)?.payment_type_id
    const mpPaymentMethodId = (mpPayment as any)?.payment_method_id

    if (mpStatus === 'approved') {
      await (prisma as any).order.update({
        where: { id },
        data: {
          status: 'PAID',
          pagoEm: paidAt,
          mercadoPagoPaymentId: mpPaymentId,
          mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
          mercadoPagoPaymentMethodId: mpPaymentMethodId ? String(mpPaymentMethodId) : null
        }
      })

      try {
        await processMercadoPagoPayment(mpPaymentId)
      } catch (err) {
        console.error('[check-mp-payment] processMercadoPagoPayment error', err)
      }

      return {
        ok: true,
        updated: true,
        status: 'PAID',
        mpStatus,
        message: 'Status atualizado para PAID'
      }
    } else {
      return {
        ok: true,
        updated: false,
        status: order.status,
        mpStatus,
        message: `Status do pagamento é ${mpStatus}, não foi aprovado ainda`
      }
    }
  } catch (err: any) {
    console.error('[check-mp-payment] error', err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro ao verificar pagamento' })
  }
})
