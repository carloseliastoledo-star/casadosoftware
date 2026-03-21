/**
 * POST /api/webhook/pagarme — recebe eventos do Pagar.me v5
 * Configura em: https://dash.pagar.me → Configurações → Webhooks
 * Eventos: charge.paid, charge.payment_failed, charge.pending
 */
import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { createHmac, timingSafeEqual } from 'crypto'
import prisma from '../../db/prisma'
import { fulfillPaidOrder } from '../../utils/orderFulfillment'
import { ensureMarketplaceCommissionForOrder } from '../../utils/marketplaceCommission'
import { sendGa4PurchaseForOrder } from '../../utils/ga4'

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = String(process.env.PAGARME_WEBHOOK_SECRET || '').trim()
  if (!secret) return true // sem segredo configurado, ignora verificação
  try {
    const hmac = createHmac('sha256', secret)
    const computed = hmac.update(rawBody).digest('hex')
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)
    const signature = getHeader(event, 'x-pagarme-signature') || ''

    if (signature) {
      const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)
      if (!verifySignature(bodyStr, signature)) {
        console.warn('[pagarme-webhook] assinatura inválida')
        throw createError({ statusCode: 400, statusMessage: 'Assinatura inválida' })
      }
    }

    const payload: any = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody

    const type = String(payload?.type || payload?.event || '').toLowerCase()
    console.log('[pagarme-webhook] evento recebido:', type)

    const charge = payload?.data || payload?.charge || payload

    // ─── charge.paid ─────────────────────────────────────────────────────────
    if (type === 'charge.paid' || (type === '' && charge?.status === 'paid')) {
      const chargeId = String(charge?.id || '').trim()
      console.log('[pagarme-webhook] charge.paid chargeId:', chargeId)
      if (!chargeId) return { received: true }

      const order = await (prisma as any).order.findFirst({
        where: { pagarmeChargeId: chargeId },
        select: { id: true, status: true },
      })

      if (!order) {
        console.warn('[pagarme-webhook] ordem não encontrada para charge', chargeId)
        return { received: true }
      }

      if (String(order.status).toUpperCase() !== 'PAID') {
        await (prisma as any).order.update({
          where: { id: order.id },
          data: { status: 'PAID', pagoEm: new Date() },
          select: { id: true },
        })

        console.log('[pagarme-webhook] ordem atualizada para PAID:', order.id)
        try { await ensureMarketplaceCommissionForOrder(order.id) } catch {}
        try { await sendGa4PurchaseForOrder(order.id, 'pagarme') } catch {}
        try { await fulfillPaidOrder(order.id) } catch (e: any) {
          console.error('[pagarme-webhook] fulfillPaidOrder error:', e?.message)
        }
      }
    }

    // ─── charge.payment_failed ───────────────────────────────────────────────
    if (type === 'charge.payment_failed' || (type === '' && charge?.status === 'failed')) {
      const chargeId = String(charge?.id || '').trim()
      if (chargeId) {
        const order = await (prisma as any).order.findFirst({
          where: { pagarmeChargeId: chargeId },
          select: { id: true, status: true },
        })
        if (order && String(order.status).toUpperCase() === 'PENDING') {
          await (prisma as any).order.update({
            where: { id: order.id },
            data: { status: 'FAILED' },
            select: { id: true },
          })
        }
      }
    }

    return { received: true }
  } catch (err: any) {
    console.error('[pagarme-webhook] erro:', err?.message || err)
    if (err?.statusCode) throw err
    return { received: true }
  }
})
