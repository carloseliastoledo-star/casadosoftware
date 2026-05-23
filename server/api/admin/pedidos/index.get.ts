import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  console.log('[admin/orders] ===== START =====')
  
  try {
    await requireAdminSession(event)
    
    // Mascarar DATABASE_URL para não expor senha
    const dbUrl = process.env.DATABASE_URL || ''
    const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
    console.log('[admin/orders] DATABASE_URL:', maskedDbUrl.substring(0, 50) + '...')
    
    // No admin, usar sempre STORE_SLUG da variável de ambiente
    const storeSlug = process.env.STORE_SLUG || null
    console.log('[admin/orders] STORE_SLUG:', storeSlug || '(não configurado)')
    
    const q = getQuery(event)
    console.log('[admin/orders] query params:', JSON.stringify(q))
    
    // Verificar se deve mostrar pedidos excluídos
    const showDeleted = String((q as any)?.showDeleted || '').trim() === '1'
    
    // Query com includes de Customer, Produto e Licenca
    const where: any = {}
    if (!showDeleted) where.deletedAt = null
    if (storeSlug) where.storeSlug = storeSlug
    
    // Filtro por data
    const dateFrom = String((q as any)?.dateFrom || '').trim()
    const dateTo = String((q as any)?.dateTo || '').trim()
    
    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      
      where.criadoEm = {
        gte: startDate,
        lte: endDate
      }
      
      console.log('[admin/orders] Filtro de data aplicado:', { 
        from: startDate.toISOString(), 
        to: endDate.toISOString() 
      })
    }
    
    console.log('[admin/orders] where clause:', JSON.stringify(where))
    console.log('[admin/orders] Filtros aplicados:', {
      showDeleted,
      hasDateFilter: !!dateFrom && !!dateTo,
      hasStoreSlugFilter: !!storeSlug
    })
    console.log('[admin/orders] Buscando pedidos com Customer, Produto e Licencas...')
    
    const orders = await (prisma as any).order.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: 200,
      include: {
        Customer: { select: { id: true, email: true, nome: true, whatsapp: true, cpf: true } },
        Produto: { select: { id: true, nome: true, slug: true } },
        Licenca: { select: { id: true, chave: true, status: true } }
      }
    })
    
    console.log('[admin/orders] Pedidos encontrados:', orders?.length || 0)
    console.log('[admin/orders] Total de pedidos retornado:', orders?.length || 0)
    
    // Log de sample de tracking
    if (orders?.length > 0) {
      const sample = orders[0]
      console.log('[admin/orders] tracking sample:', {
        id: sample.id,
        utmSource: sample.utmSource,
        utmMedium: sample.utmMedium,
        utmCampaign: sample.utmCampaign,
        gclid: sample.gclid,
        landingPage: sample.landingPage,
        checkoutPage: sample.checkoutPage,
        trafficSourceType: sample.trafficSourceType
      })
    }
    
    // Mapear para o formato esperado pelo frontend
    const mappedOrders = orders.map((o: any) => ({
      id: o.id,
      numero: o.numero,
      status: o.status,
      storeSlug: o.storeSlug,
      criadoEm: o.criadoEm,
      pagoEm: o.pagoEm,
      totalAmount: o.totalAmount,
      mercadoPagoPaymentTypeId: o.mercadoPagoPaymentTypeId,
      mercadoPagoPaymentMethodId: o.mercadoPagoPaymentMethodId,
      produto: o.Produto,
      customer: o.Customer,
      licencas: o.Licenca,
      // Campos de tracking
      trafficSourceType: o.trafficSourceType,
      utmSource: o.utmSource,
      utmMedium: o.utmMedium,
      utmCampaign: o.utmCampaign,
      utmTerm: o.utmTerm,
      utmContent: o.utmContent,
      gclid: o.gclid,
      fbclid: o.fbclid,
      referrer: o.referrer,
      landingPage: o.landingPage,
      checkoutPage: o.checkoutPage,
      firstTouchSource: o.firstTouchSource,
      firstTouchMedium: o.firstTouchMedium,
      firstTouchCampaign: o.firstTouchCampaign,
      firstTouchContent: o.firstTouchContent,
      firstTouchTerm: o.firstTouchTerm,
      firstTouchGclid: o.firstTouchGclid,
      firstTouchFbclid: o.firstTouchFbclid,
      firstTouchReferrer: o.firstTouchReferrer,
      firstTouchLandingPage: o.firstTouchLandingPage,
      lastTouchSource: o.lastTouchSource,
      lastTouchMedium: o.lastTouchMedium,
      lastTouchCampaign: o.lastTouchCampaign,
      lastTouchContent: o.lastTouchContent,
      lastTouchTerm: o.lastTouchTerm,
      lastTouchGclid: o.lastTouchGclid,
      lastTouchFbclid: o.lastTouchFbclid,
      lastTouchReferrer: o.lastTouchReferrer,
      lastTouchLandingPage: o.lastTouchLandingPage,
      trackingUserAgent: o.trackingUserAgent,
      trackingDevice: o.trackingDevice
    }))
    
    // Summary - usando o mesmo filtro de data + status PAID
    const summaryWhere = { ...where, status: 'PAID' }
    console.log('[admin/orders] summary where:', JSON.stringify(summaryWhere))
    
    const summaryAgg = await (prisma as any).order.aggregate({
      where: summaryWhere,
      _count: { id: true },
      _sum: { totalAmount: true }
    })
    
    const summary = {
      countPaid: Number(summaryAgg?._count?.id || 0),
      totalPaid: Number(summaryAgg?._sum?.totalAmount || 0)
    }
    
    console.log('[admin/orders] Summary:', JSON.stringify(summary))
    console.log('[admin/orders] ===== END =====')
    
    return { ok: true, orders: mappedOrders, summary }
    
  } catch (err: any) {
    console.error('[admin/orders] ===== ERROR =====')
    console.error('[admin/orders] full error:', err)
    console.error('[admin/orders] message:', err?.message)
    console.error('[admin/orders] code:', err?.code)
    console.error('[admin/orders] meta:', err?.meta)
    console.error('[admin/orders] stack:', err?.stack)
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
