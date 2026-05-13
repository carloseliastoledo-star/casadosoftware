import { defineEventHandler, requireAdminSession } from 'h3'
import prisma from '../../../db/prisma'
import { getMpAccessToken } from '../../../utils/mercadopago.js'
import { markOrderAsPaid } from '../../../services/markOrderAsPaid.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  console.log('[reconcile-payments] Starting payment reconciliation')

  // Buscar pedidos PENDING dos últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const pendingOrders = await (prisma as any).order.findMany({
    where: {
      status: 'PENDING',
      deletedAt: null,
      criadoEm: { gte: sevenDaysAgo }
    },
    select: {
      id: true,
      numero: true,
      mercadoPagoPaymentId: true,
      totalAmount: true,
      criadoEm: true
    },
    orderBy: { criadoEm: 'desc' },
    take: 100
  })

  console.log(`[reconcile-payments] Found ${pendingOrders.length} pending orders`)

  const results = {
    total: pendingOrders.length,
    reconciled: 0,
    alreadyPaid: 0,
    notFound: 0,
    notApproved: 0,
    errors: 0,
    details: [] as any[]
  }

  const accessToken = getMpAccessToken()

  for (const order of pendingOrders) {
    try {
      let paymentId = order.mercadoPagoPaymentId

      // Se não tem paymentId, tentar buscar por external_reference
      if (!paymentId) {
        console.log(`[reconcile-payments] Order ${order.numero} has no paymentId, searching by external_reference`)
        const searchResp = await fetch(
          `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(order.id)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )

        if (searchResp.ok) {
          const searchData = await searchResp.json() as any
          const payments = searchData?.results || []
          if (payments.length > 0) {
            paymentId = String(payments[0]?.id || '')
            console.log(`[reconcile-payments] Found paymentId ${paymentId} for order ${order.numero}`)
          }
        }
      }

      if (!paymentId) {
        console.log(`[reconcile-payments] No paymentId found for order ${order.numero}`)
        results.notFound++
        results.details.push({
          orderNumero: order.numero,
          orderId: order.id,
          status: 'not_found',
          message: 'No paymentId found'
        })
        continue
      }

      // Buscar detalhes do pagamento
      const paymentResp = await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!paymentResp.ok) {
        console.log(`[reconcile-payments] Failed to fetch payment ${paymentId} for order ${order.numero}`)
        results.errors++
        results.details.push({
          orderNumero: order.numero,
          orderId: order.id,
          paymentId,
          status: 'error',
          message: 'Failed to fetch payment'
        })
        continue
      }

      const payment = await paymentResp.json() as any
      const status = String(payment?.status || '').toLowerCase()

      console.log(`[reconcile-payments] Order ${order.numero} payment status: ${status}`)

      if (status === 'approved') {
        // Verificar se o pedido já foi pago (evitar duplicidade)
        const currentOrder = await (prisma as any).order.findUnique({
          where: { id: order.id },
          select: { status: true, pagoEm: true }
        })

        if (currentOrder?.status === 'PAID' && currentOrder?.pagoEm) {
          console.log(`[reconcile-payments] Order ${order.numero} already PAID`)
          results.alreadyPaid++
          results.details.push({
            orderNumero: order.numero,
            orderId: order.id,
            paymentId,
            status: 'already_paid',
            message: 'Order already PAID'
          })
          continue
        }

        // Marcar como pago usando a função centralizada
        await markOrderAsPaid({
          orderId: order.id,
          gateway: 'mercadopago',
          paymentId,
          source: 'reconciliation',
          paymentMethodId: payment.payment_method_id ? String(payment.payment_method_id) : undefined,
          paymentTypeId: payment.payment_type_id ? String(payment.payment_type_id) : undefined
        })

        console.log(`[reconcile-payments] Order ${order.numero} reconciled to PAID`)
        results.reconciled++
        results.details.push({
          orderNumero: order.numero,
          orderId: order.id,
          paymentId,
          status: 'reconciled',
          message: 'Order marked as PAID'
        })
      } else {
        console.log(`[reconcile-payments] Order ${order.numero} payment not approved: ${status}`)
        results.notApproved++
        results.details.push({
          orderNumero: order.numero,
          orderId: order.id,
          paymentId,
          status: 'not_approved',
          message: `Payment status: ${status}`
        })
      }
    } catch (err: any) {
      console.error(`[reconcile-payments] Error processing order ${order.numero}:`, err)
      results.errors++
      results.details.push({
        orderNumero: order.numero,
        orderId: order.id,
        status: 'error',
        message: String(err?.message || 'Unknown error')
      })
    }
  }

  console.log('[reconcile-payments] Reconciliation complete:', results)

  return {
    ok: true,
    results
  }
})
