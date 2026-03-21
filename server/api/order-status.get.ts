import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getMpPayment } from '#root/server/utils/mercadopago'
import { processMercadoPagoPayment } from '#root/server/utils/mercadopagoWebhook'
import { getPagarmeCharge } from '#root/server/services/pagarme'
import { fulfillPaidOrder } from '#root/server/utils/orderFulfillment'
import { ensureMarketplaceCommissionForOrder } from '#root/server/utils/marketplaceCommission'
import { sendGa4PurchaseForOrder } from '#root/server/utils/ga4'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const ctx = getStoreContext()
  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId obrigatório' })
  }

  let order = await prisma.order.findFirst({
    where: whereForStore({ id: orderId }, ctx) as any,
    select: {
      id: true,
      status: true,
      storeSlug: true,
      pagoEm: true,
      mercadoPagoPaymentId: true,
      pagarmeChargeId: true,
      emailEnviadoEm: true
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  const statusUpper = String(order.status || '').toUpperCase()
  const mpPaymentId = String(order.mercadoPagoPaymentId || '').trim()
  const pgChargeId = String((order as any).pagarmeChargeId || '').trim()

  let fulfillmentAttempted = false
  let fulfillmentError = ''

  if (statusUpper !== 'PAID' && mpPaymentId) {
    try {
      const payment = getMpPayment()
      const mpPayment = await payment.get({ id: mpPaymentId })
      const mpStatus = String((mpPayment as any)?.status || '').toLowerCase()

      if (mpStatus === 'approved') {
        order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            pagoEm: new Date(),
            mercadoPagoPaymentId: String((mpPayment as any)?.id || mpPaymentId)
          },
          select: {
            id: true,
            status: true,
            storeSlug: true,
            pagoEm: true,
            mercadoPagoPaymentId: true,
            pagarmeChargeId: true,
            emailEnviadoEm: true
          }
        })

        fulfillmentAttempted = true
        try {
          await processMercadoPagoPayment(String((mpPayment as any)?.id || mpPaymentId))
        } catch (err: any) {
          fulfillmentError = String(err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento')
          console.log('[order-status] processMercadoPagoPayment error', err)
        }
      }
    } catch {
      // se falhar (token/MP indisponível), apenas retorna o status atual do pedido
    }
  }

  // ─── Pagar.me check ────────────────────────────────────────────────────
  if (statusUpper !== 'PAID' && pgChargeId) {
    try {
      const charge = await getPagarmeCharge(pgChargeId)
      const pgStatus = String(charge?.status || '').toLowerCase()

      if (pgStatus === 'paid') {
        order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            pagoEm: new Date()
          },
          select: {
            id: true,
            status: true,
            storeSlug: true,
            pagoEm: true,
            mercadoPagoPaymentId: true,
            pagarmeChargeId: true,
            emailEnviadoEm: true
          }
        })

        fulfillmentAttempted = true
        try {
          await fulfillPaidOrder(orderId)
        } catch (err: any) {
          fulfillmentError = String(err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento')
          console.log('[order-status] fulfillPaidOrder (pagarme) error', err)
        }
        try { await ensureMarketplaceCommissionForOrder(orderId) } catch {}
        try { await sendGa4PurchaseForOrder(orderId, 'pagarme') } catch {}
      }
    } catch {
      // se falhar, apenas retorna o status atual do pedido
    }
  }

  if (statusUpper === 'PAID' && !order.emailEnviadoEm && pgChargeId && !mpPaymentId) {
    fulfillmentAttempted = true
    try {
      await fulfillPaidOrder(orderId)
    } catch (err: any) {
      fulfillmentError = String(err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento')
      console.log('[order-status] reprocessFulfillment (pagarme) error', err)
    }

    order = await prisma.order.findFirst({
      where: whereForStore({ id: orderId }, ctx) as any,
      select: {
        id: true,
        status: true,
        storeSlug: true,
        pagoEm: true,
        mercadoPagoPaymentId: true,
        pagarmeChargeId: true,
        emailEnviadoEm: true
      }
    })

    if (!order) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
    }
  }

  if (statusUpper === 'PAID' && !order.emailEnviadoEm && mpPaymentId) {
    fulfillmentAttempted = true
    try {
      await processMercadoPagoPayment(mpPaymentId)
    } catch (err: any) {
      fulfillmentError = String(err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento')
      console.log('[order-status] reprocessMercadoPagoPayment error', err)
    }

    order = await prisma.order.findFirst({
      where: whereForStore({ id: orderId }, ctx) as any,
      select: {
        id: true,
        status: true,
        storeSlug: true,
        pagoEm: true,
        mercadoPagoPaymentId: true,
        emailEnviadoEm: true
      }
    })

    if (!order) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
    }
  }

  return {
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      pagoEm: order.pagoEm,
      mercadoPagoPaymentId: order.mercadoPagoPaymentId,
      emailEnviadoEm: order.emailEnviadoEm
    },
    fulfillmentAttempted,
    fulfillmentError
  }
})
