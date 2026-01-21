import { defineEventHandler, readBody } from 'h3'
import { processMercadoPagoMerchantOrder, processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const type = String(body?.type || body?.topic || '')
    const dataId = String(body?.data?.id || body?.id || body?.['data.id'] || '')

    console.log('[mp webhook] POST', { type, dataId })

    if (type === 'merchant_order' && dataId) {
      return await processMercadoPagoMerchantOrder(dataId)
    }

    if (type !== 'payment' || !dataId) {
      return { ok: true }
    }

    return await processMercadoPagoPayment(dataId)
  } catch (err) {
    console.log('[mp webhook] POST handler error', err)
    return { ok: true }
  }
})
