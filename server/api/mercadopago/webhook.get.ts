import { defineEventHandler, getQuery } from 'h3'
import { processMercadoPagoMerchantOrder, processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const topic = String((query as any)?.topic || (query as any)?.type || '')
    const dataId = String((query as any)?.id || (query as any)?.['data.id'] || '')
    const debug = String((query as any)?.debug || '') === '1'

    console.log('[mp webhook] GET', { topic, dataId })

    if (debug) {
      return { ok: true, debug: { topic, dataId } }
    }

    if (topic === 'merchant_order' && dataId) {
      processMercadoPagoMerchantOrder(dataId).catch((err) => {
        console.log('[mp webhook] merchant_order background error', err)
      })
      return { ok: true }
    }

    if (topic !== 'payment' || !dataId) {
      return { ok: true }
    }

    processMercadoPagoPayment(dataId).catch((err) => {
      console.log('[mp webhook] payment background error', err)
    })
    return { ok: true }
  } catch (err) {
    console.log('[mp webhook] GET handler error', err)
    return { ok: true }
  }
})
