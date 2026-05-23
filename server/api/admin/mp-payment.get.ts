import { defineEventHandler, getQuery } from 'h3'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  console.log('[mp-payment] ===== BUSCANDO PAGAMENTO ESPECÍFICO =====')
  
  const q = getQuery(event)
  const paymentId = String(q?.paymentId || '').trim()
  
  if (!paymentId) {
    return { ok: false, error: 'paymentId é obrigatório' }
  }

  console.log('[mp-payment] PaymentId:', paymentId)
  
  const payment = getMpPayment()

  try {
    // Buscar pagamento específico no Mercado Pago
    const result = await payment.get({ id: paymentId })
    
    console.log('[mp-payment] Pagamento encontrado:', result?.id)

    return {
      ok: true,
      payment: {
        paymentId: result.id,
        status: result.status,
        status_detail: result.status_detail,
        date_created: result.date_created,
        date_approved: result.date_approved,
        transaction_amount: result.transaction_amount,
        payer: {
          email: result.payer?.email,
          first_name: result.payer?.first_name,
          last_name: result.payer?.last_name
        },
        external_reference: result.external_reference,
        metadata: result.metadata,
        description: result.description,
        payment_method_id: result.payment_method_id
      }
    }

  } catch (err: any) {
    console.error('[mp-payment] Erro:', err)
    return { ok: false, error: err?.message || 'Erro desconhecido' }
  }
})
