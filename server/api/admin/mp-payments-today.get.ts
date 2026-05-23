import { defineEventHandler } from 'h3'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  console.log('[mp-payments-today] ===== BUSCANDO PAGAMENTOS DE HOJE =====')
  
  const payment = getMpPayment()
  
  // Data de hoje em UTC
  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const dateFrom = startOfDay.toISOString().split('T')[0]
  const dateTo = endOfDay.toISOString().split('T')[0]

  console.log('[mp-payments-today] Período:', {
    dateFrom,
    dateTo,
    timezone: 'UTC'
  })

  try {
    // Buscar pagamentos do Mercado Pago usando SDK
    const result = await payment.search({
      qs: {
        date_created_from: dateFrom,
        date_created_to: dateTo,
        limit: 100
      }
    })

    const payments = Array.isArray(result?.results) ? result.results : []
    console.log('[mp-payments-today] Pagamentos encontrados:', payments.length)

    // Filtrar apenas pagamentos approved
    const approvedPayments = payments.filter((p: any) => p.status === 'approved')
    console.log('[mp-payments-today] Pagamentos approved:', approvedPayments.length)

    // Extrair informações relevantes
    const paymentDetails = approvedPayments.map((p: any) => ({
      paymentId: p.id,
      status: p.status,
      status_detail: p.status_detail,
      date_created: p.date_created,
      date_approved: p.date_approved,
      transaction_amount: p.transaction_amount,
      payer: {
        email: p.payer?.email,
        first_name: p.payer?.first_name,
        last_name: p.payer?.last_name
      },
      external_reference: p.external_reference,
      metadata: p.metadata,
      description: p.description,
      payment_method_id: p.payment_method_id
    }))

    return {
      ok: true,
      period: {
        dateFrom,
        dateTo,
        timezone: 'UTC'
      },
      totalPayments: payments.length,
      approvedPayments: approvedPayments.length,
      payments: paymentDetails
    }

  } catch (err: any) {
    console.error('[mp-payments-today] Erro:', err)
    return { ok: false, error: err?.message || 'Erro desconhecido' }
  }
})
