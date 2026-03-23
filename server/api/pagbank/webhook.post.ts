import { defineEventHandler, readBody } from 'h3'
import prisma from '../../db/prisma.js'

/**
 * Webhook PagBank — notificação de mudança de status de charge.
 * PagBank envia POST com o objeto da charge atualizada.
 * Configure em: https://dev.pagbank.uol.com.br > Webhooks
 * URL: https://casadosoftware.com.br/api/pagbank/webhook
 */
export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await readBody(event)
  } catch {
    return { ok: true }
  }

  const chargeId = String(body?.id || body?.charge?.id || '').trim()
  const status = String(body?.status || body?.charge?.status || '').toUpperCase()

  console.log('[pagbank webhook] charge:', chargeId, 'status:', status)

  if (!chargeId || !status) return { ok: true }

  const paid = status === 'PAID'

  if (!paid) return { ok: true }

  const order = await (prisma as any).order.findFirst({
    where: { pagbankChargeId: chargeId },
    select: { id: true, status: true, storeSlug: true, produtoId: true, customerId: true, totalAmount: true }
  })

  if (!order) {
    console.warn('[pagbank webhook] pedido não encontrado para charge:', chargeId)
    return { ok: true }
  }

  if (order.status === 'PAID') {
    console.log('[pagbank webhook] pedido já pago:', order.id)
    return { ok: true }
  }

  await (prisma as any).order.update({
    where: { id: order.id },
    data: { status: 'PAID', pagoEm: new Date() }
  })

  console.log('[pagbank webhook] pedido marcado como PAID:', order.id)

  return { ok: true }
})
