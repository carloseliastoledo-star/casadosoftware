import { defineEventHandler, readBody } from 'h3'
import { processMercadoPagoMerchantOrder, processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const type = String(body?.type || body?.topic || '')
    const dataId = String(body?.data?.id || body?.id || body?.['data.id'] || '')

    console.log('[mp webhook] POST', { type, dataId })

    if (type === 'merchant_order' && dataId) {
      try {
        await processMercadoPagoMerchantOrder(dataId)
      } catch (err) {
        console.error('[mp webhook] merchant_order error', err)
      }
      return { ok: true }
    }

    if (type !== 'payment' || !dataId) {
      return { ok: true }
    }

    try {
      await processMercadoPagoPayment(dataId)
    } catch (err) {
      console.error('[mp webhook] payment error', err)
    }

    return { ok: true }
  } catch (err) {
    console.error('[mp webhook] POST handler error', err)
    return { ok: true }
  }
})
