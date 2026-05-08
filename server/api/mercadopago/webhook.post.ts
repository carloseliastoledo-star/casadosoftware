import { defineEventHandler, readBody } from 'h3'
import { processMercadoPagoMerchantOrder, processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const type = String(body?.type || body?.topic || '')
    const dataId = String(body?.data?.id || body?.id || body?.['data.id'] || '')
    
    // Log completo para diagnóstico
    console.log('[mp webhook] POST received', { 
      type, 
      dataId, 
      fullBody: JSON.stringify(body),
      timestamp: new Date().toISOString()
    })

    if (type === 'merchant_order' && dataId) {
      console.log('[mp webhook] Processing merchant_order:', dataId)
      try {
        await processMercadoPagoMerchantOrder(dataId)
        console.log('[mp webhook] merchant_order processed successfully')
      } catch (err: any) {
        console.error('[mp webhook] merchant_order error', { 
          error: err?.message || String(err),
          dataId 
        })
      }
      return { ok: true }
    }

    if (type !== 'payment' || !dataId) {
      console.log('[mp webhook] Ignoring - not a payment event', { type, dataId })
      return { ok: true }
    }

    console.log('[mp webhook] Processing payment:', dataId)
    try {
      await processMercadoPagoPayment(dataId)
      console.log('[mp webhook] payment processed successfully')
    } catch (err: any) {
      console.error('[mp webhook] payment error', { 
        error: err?.message || String(err),
        dataId 
      })
    }

    return { ok: true }
  } catch (err: any) {
    console.error('[mp webhook] POST handler error', { 
      error: err?.message || String(err),
      stack: err?.stack 
    })
    return { ok: true }
  }
})
