import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { getMpPayment } from '../../utils/mercadopago.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const action = String(body?.action || '').trim()

  if (action === 'check') {
    return await checkTodayPayments()
  } else if (action === 'sync') {
    return await syncTodayPayments()
  } else {
    throw createError({ statusCode: 400, statusMessage: 'action deve ser "check" ou "sync"' })
  }
})

async function checkTodayPayments() {
  console.log('[admin sync-mp-today] Buscando pagamentos de hoje no Mercado Pago')

  const payment = getMpPayment()
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateFrom = yesterday.toISOString().split('T')[0]
  
  try {
    const result = await payment.search({
      qs: {
        date_created_from: dateFrom,
        limit: 100
      }
    })

    const payments = Array.isArray(result?.results) ? result.results : []
    
    console.log(`[admin sync-mp-today] ${payments.length} pagamentos encontrados no Mercado Pago`)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dbOrders = await prisma.order.findMany({
      where: { criadoEm: { gte: today } },
      select: { id: true, mercadoPagoPaymentId: true, status: true }
    })
    
    const dbPaymentIds = new Set(dbOrders.map((o: any) => o.mercadoPagoPaymentId).filter(Boolean))
    
    const missingPayments = payments.filter((p: any) => {
      const paymentId = String(p?.id || '')
      return paymentId && !dbPaymentIds.has(paymentId)
    })

    return {
      ok: true,
      totalMpPayments: payments.length,
      totalDbOrders: dbOrders.length,
      missingPayments: missingPayments.map((p: any) => ({
        paymentId: p.id,
        status: p.status,
        amount: p.transaction_amount,
        date: p.date_created,
        email: p.payer?.email,
        externalReference: p.external_reference
      }))
    }
  } catch (err: any) {
    console.error('[admin sync-mp-today] Erro ao buscar pagamentos:', err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro ao buscar pagamentos' })
  }
}

async function syncTodayPayments() {
  console.log('[admin sync-mp-today] Sincronizando pagamentos de hoje')

  const payment = getMpPayment()
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateFrom = yesterday.toISOString().split('T')[0]
  
  try {
    const result = await payment.search({
      qs: {
        date_created_from: dateFrom,
        limit: 100
      }
    })

    const payments = Array.isArray(result?.results) ? result.results : []
    
    console.log(`[admin sync-mp-today] ${payments.length} pagamentos para sincronizar`)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dbOrders = await prisma.order.findMany({
      where: { criadoEm: { gte: today } },
      select: { id: true, mercadoPagoPaymentId: true, status: true }
    })
    
    const dbPaymentIds = new Set(dbOrders.map((o: any) => o.mercadoPagoPaymentId).filter(Boolean))
    
    let synced = 0
    let errors = 0
    const errorDetails: any[] = []

    for (const mpPayment of payments) {
      const paymentId = String(mpPayment?.id || '')
      if (!paymentId) continue
      
      if (dbPaymentIds.has(paymentId)) continue
      
      const externalReference = String(mpPayment?.external_reference || '')
      if (externalReference) {
        try {
          const existingOrder = await prisma.order.findFirst({
            where: { id: externalReference }
          })
          
          if (existingOrder) {
            const status = mpPayment.status === 'approved' ? 'PAID' : String(mpPayment.status).toUpperCase()
            const pagoEm = mpPayment.status === 'approved' && mpPayment.date_approved ? new Date(mpPayment.date_approved) : null
            
            await prisma.order.update({
              where: { id: externalReference },
              data: {
                mercadoPagoPaymentId: paymentId,
                mercadoPagoPaymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : null,
                mercadoPagoPaymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : null,
                status,
                pagoEm
              }
            })
            
            synced++
            continue
          }
        } catch (err) {
          errors++
          errorDetails.push({ paymentId, error: String(err) })
          continue
        }
      }
      
      try {
        const email = String(mpPayment?.payer?.email || '').trim().toLowerCase()
        const valor = Number(mpPayment?.transaction_amount)
        const produtoId = mpPayment?.metadata?.produtoId || null
        const storeSlug = mpPayment?.metadata?.storeSlug || 'casadosoftware'
        
        if (!email || !produtoId) {
          errors++
          errorDetails.push({ paymentId, error: 'Email ou produtoId não encontrado' })
          continue
        }
        
        const produto = await prisma.produto.findUnique({
          where: { id: produtoId },
          select: { id: true, nome: true, preco: true }
        })
        
        if (!produto) {
          errors++
          errorDetails.push({ paymentId, error: `Produto não encontrado: ${produtoId}` })
          continue
        }
        
        const customer = await prisma.customer.upsert({
          where: { email_storeSlug: { email, storeSlug } },
          create: { email, storeSlug, nome: email },
          update: { nome: email }
        })
        
        const status = mpPayment.status === 'approved' ? 'PAID' : String(mpPayment.status).toUpperCase()
        const pagoEm = mpPayment.status === 'approved' && mpPayment.date_approved ? new Date(mpPayment.date_approved) : null
        
        const order = await prisma.order.create({
          data: {
            status,
            storeSlug,
            produtoId: produto.id,
            customerId: customer.id,
            mercadoPagoPaymentId: paymentId,
            mercadoPagoPaymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : null,
            mercadoPagoPaymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : null,
            subtotalAmount: valor,
            totalAmount: valor,
            pagoEm
          }
        })
        
        synced++
      } catch (err) {
        errors++
        errorDetails.push({ paymentId, error: String(err) })
      }
    }

    return {
      ok: true,
      totalMpPayments: payments.length,
      synced,
      errors,
      errorDetails
    }
  } catch (err: any) {
    console.error('[admin sync-mp-today] Erro ao sincronizar:', err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Erro ao sincronizar' })
  }
}
