import { defineEventHandler, getQuery } from 'h3'
import { processMercadoPagoMerchantOrder, processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const topic = String((query as any)?.topic || (query as any)?.type || '')
  const dataId = String((query as any)?.id || (query as any)?.['data.id'] || '')

  console.log('[mp webhook] GET', { topic, dataId })

  if (topic === 'merchant_order' && dataId) {
    return await processMercadoPagoMerchantOrder(dataId)
  }

  if (topic !== 'payment' || !dataId) {
    return { ok: true }
  }

  return await processMercadoPagoPayment(dataId)
})
