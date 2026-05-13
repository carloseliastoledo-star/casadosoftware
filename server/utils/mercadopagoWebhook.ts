import prisma from '../db/prisma'
import { getMpAccessToken, getMpPayment } from './mercadopago.js'
import { markOrderAsPaid } from '../services/markOrderAsPaid.js'

export async function processMercadoPagoPayment(dataId: string) {
  try {
    const payment = getMpPayment()
    const mpPayment = await payment.get({ id: dataId })

    const status = String((mpPayment as any)?.status || '')
    const paymentTypeId = (mpPayment as any)?.payment_type_id
    const paymentMethodId = (mpPayment as any)?.payment_method_id
    const orderId = (mpPayment as any)?.metadata?.orderId || (mpPayment as any)?.external_reference

    console.log('[mp webhook] Payment received:', { dataId, status, orderId })

    if (!orderId) {
      console.log('[mp webhook] No orderId found, skipping')
      return { ok: true }
    }

    if (status === 'approved') {
      console.log('[mp webhook] Payment approved, calling markOrderAsPaid')
      await markOrderAsPaid({
        orderId: String(orderId),
        gateway: 'mercadopago',
        paymentId: String((mpPayment as any)?.id || dataId),
        source: 'webhook',
        paymentMethodId: paymentMethodId ? String(paymentMethodId) : undefined,
        paymentTypeId: paymentTypeId ? String(paymentTypeId) : undefined
      })
    } else if (status === 'rejected' || status === 'cancelled') {
      try {
        await (prisma as any).order.update({
          where: { id: String(orderId) },
          data: {
            status: status.toUpperCase(),
            mercadoPagoPaymentId: String((mpPayment as any)?.id || dataId),
            mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
            mercadoPagoPaymentMethodId: paymentMethodId ? String(paymentMethodId) : null
          }
        })
        console.log('[mp webhook] Order updated to REJECTED/CANCELLED', { orderId, status })
      } catch (err: any) {
        const code = String(err?.code || '')
        if (code === 'P2025') {
          console.log('[mp webhook] order not found for rejected/cancelled payment', { orderId: String(orderId), dataId })
          return { ok: true }
        }
        if (code === 'P2002') {
          console.log('[mp webhook] unique constraint on rejected/cancelled (duplicado)', { orderId: String(orderId), dataId })
          return { ok: true }
        }
        throw err
      }
    }

    return { ok: true }
  } catch (err: any) {
    console.error('[mp webhook] processMercadoPagoPayment error:', {
      message: err?.message || String(err),
      code: err?.code,
      meta: err?.meta,
      dataId
    })
    return { ok: true }
  }
}

export async function processMercadoPagoMerchantOrder(merchantOrderId: string) {
  try {
    const accessToken = getMpAccessToken()

    const resp = await fetch(`https://api.mercadopago.com/merchant_orders/${encodeURIComponent(merchantOrderId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!resp.ok) {
      console.log('[mp webhook] merchant_order fetch failed', { merchantOrderId, status: resp.status })
      return { ok: true }
    }

    const mo = (await resp.json()) as any
    const payments = Array.isArray(mo?.payments) ? mo.payments : []

    const candidate = payments.find((p: any) => String(p?.status || '').toLowerCase() === 'approved') || payments[0]
    const paymentId = String(candidate?.id || '')

    if (!paymentId) {
      console.log('[mp webhook] merchant_order no payment id', { merchantOrderId })
      return { ok: true }
    }

    return await processMercadoPagoPayment(paymentId)
  } catch (err) {
    console.log('[mp webhook] processMercadoPagoMerchantOrder error', err)
    return { ok: true }
  }
}
