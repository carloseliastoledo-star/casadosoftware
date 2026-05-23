import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { getMpPayment } from '../../utils/mercadopago.js'
import { markOrderAsPaid } from '../../services/markOrderAsPaid.js'

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
  
  // Buscar pagamentos das últimas 24h
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

    // Buscar pedidos do banco para comparar
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dbOrders = await prisma.order.findMany({
      where: { criadoEm: { gte: today } },
      select: { id: true, mercadoPagoPaymentId: true, status: true }
    })
    
    const dbPaymentIds = new Set(dbOrders.map((o: any) => o.mercadoPagoPaymentId).filter(Boolean))
    
    // Identificar pagamentos sem pedido correspondente
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

    // Buscar pedidos do banco
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
      
      // Se já existe pedido com esse paymentId, pular
      if (dbPaymentIds.has(paymentId)) continue
      
      // Se tem external_reference, tentar atualizar pedido existente
      const externalReference = String(mpPayment?.external_reference || '')
      if (externalReference) {
        try {
          const existingOrder = await prisma.order.findFirst({
            where: { id: externalReference }
          })
          
          if (existingOrder) {
            await prisma.order.update({
              where: { id: externalReference },
              data: {
                mercadoPagoPaymentId: paymentId,
                mercadoPagoPaymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : null,
                mercadoPagoPaymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : null,
                status: mpPayment.status === 'approved' ? 'PAID' : mpPayment.status.toUpperCase(),
                pagoEm: mpPayment.status === 'approved' ? new Date(mpPayment.date_approved) : null
              }
            })
            
            if (mpPayment.status === 'approved') {
              try {
                await markOrderAsPaid({
                  orderId: externalReference,
                  gateway: 'mercadopago',
                  paymentId: paymentId,
                  source: 'webhook',
                  paymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : undefined,
                  paymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : undefined
                })
              } catch (err) {
                console.error('[admin sync-mp-today] markOrderAsPaid error:', err)
              }
            }
            
            synced++
            continue
          }
        } catch (err) {
          errors++
          errorDetails.push({ paymentId, error: String(err) })
          continue
        }
      }
      
      // Se não tem external_reference ou pedido não existe, criar manualmente
      try {
        const email = String(mpPayment?.payer?.email || '').trim().toLowerCase()
        const nome = `${mpPayment?.payer?.first_name || ''} ${mpPayment?.payer?.last_name || ''}`.trim()
        const valor = Number(mpPayment?.transaction_amount)
        const produtoId = mpPayment?.metadata?.produtoId || null
        const storeSlug = mpPayment?.metadata?.storeSlug || 'casadosoftware'
        
        if (!email || !produtoId) {
          errors++
          errorDetails.push({ paymentId, error: 'Email ou produtoId não encontrado' })
          continue
        }
        
        // Buscar produto
        const produto = await prisma.produto.findUnique({
          where: { id: produtoId },
          select: { id: true, nome: true, preco: true }
        })
        
        if (!produto) {
          errors++
          errorDetails.push({ paymentId, error: `Produto não encontrado: ${produtoId}` })
          continue
        }
        
        // Criar ou buscar customer
        const customer = await prisma.customer.upsert({
          where: { email_storeSlug: { email, storeSlug } },
          create: { email, storeSlug, nome },
          update: { nome }
        })
        
        // Criar pedido
        const order = await prisma.order.create({
          data: {
            status: mpPayment.status === 'approved' ? 'PAID' : mpPayment.status.toUpperCase(),
            storeSlug,
            produtoId: produto.id,
            customerId: customer.id,
            mercadoPagoPaymentId: paymentId,
            mercadoPagoPaymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : null,
            mercadoPagoPaymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : null,
            subtotalAmount: valor,
            totalAmount: valor,
            pagoEm: mpPayment.status === 'approved' ? new Date(mpPayment.date_approved) : null
          }
        })
        
        if (mpPayment.status === 'approved') {
          try {
            await markOrderAsPaid({
              orderId: order.id,
              gateway: 'mercadopago',
              paymentId: paymentId,
              source: 'webhook',
              paymentMethodId: mpPayment.payment_method_id ? String(mpPayment.payment_method_id) : undefined,
              paymentTypeId: mpPayment.payment_type_id ? String(mpPayment.payment_type_id) : undefined
            })
          } catch (err) {
            console.error('[admin sync-mp-today] markOrderAsPaid error:', err)
          }
        }
        
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
})
