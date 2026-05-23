import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[mp-payments-today] ===== BUSCANDO PAGAMENTOS DE HOJE =====')
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return { ok: false, error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' }
  }

  // Data de hoje em UTC
  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  console.log('[mp-payments-today] Período:', {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString(),
    timezone: 'UTC'
  })

  try {
    // Buscar pagamentos do Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments?date_created_from=${startOfDay.toISOString()}&date_created_to=${endOfDay.toISOString()}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[mp-payments-today] Erro Mercado Pago:', response.status, errorText)
      return { ok: false, error: `Erro Mercado Pago: ${response.status} - ${errorText}` }
    }

    const data = await response.json()
    const payments = data.results || []

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
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
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
