import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { getMpAccessToken } from '../../utils/mercadopago.js'
import { markOrderAsPaid } from '../../services/markOrderAsPaid.js'

export default defineEventHandler(async (event) => {
  console.log('[cron reconcile-payments] Starting automatic payment reconciliation')

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
    take: 50
  })

  console.log(`[cron reconcile-payments] Found ${pendingOrders.length} pending orders`)

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
          }
        }
      }

      if (!paymentId) {
        results.notFound++
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
        results.errors++
        continue
      }

      const payment = await paymentResp.json() as any
      const status = String(payment?.status || '').toLowerCase()

      if (status === 'approved') {
        // Verificar se o pedido já foi pago
        const currentOrder = await (prisma as any).order.findUnique({
          where: { id: order.id },
          select: { status: true, pagoEm: true }
        })

        if (currentOrder?.status === 'PAID' && currentOrder?.pagoEm) {
          results.alreadyPaid++
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

        console.log(`[cron reconcile-payments] Order ${order.numero} reconciled to PAID`)
        results.reconciled++
        results.details.push({
          orderNumero: order.numero,
          orderId: order.id,
          paymentId,
          status: 'reconciled'
        })
      } else if (status === 'rejected' || status === 'cancelled') {
        results.notApproved++
      }
    } catch (err: any) {
      console.error(`[cron reconcile-payments] Error processing order ${order.numero}:`, err)
      results.errors++
    }
  }

  console.log('[cron reconcile-payments] Reconciliation complete:', results)

  return {
    ok: true,
    results,
    timestamp: new Date().toISOString()
  }
})
