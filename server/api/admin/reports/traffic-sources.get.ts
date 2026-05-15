import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext, whereForStore } from '../../../utils/store.js'
import { classifyTrafficSource, groupOrdersByChannel } from '../../../utils/trafficSource.js'

export default defineEventHandler(async (event) => {
  console.log('[admin/reports/traffic-sources] ===== START =====')

  try {
    await requireAdminSession(event)
    console.log('[admin/reports/traffic-sources] Admin autenticado')

    const ctx = getStoreContext(event)
    console.log('[admin/reports/traffic-sources] storeSlug:', ctx.storeSlug || '(null)')

    const q = getQuery(event)

    // Filtros de data
    const dateFrom = String((q as any)?.dateFrom || '').trim()
    const dateTo = String((q as any)?.dateTo || '').trim()

    // Query base - apenas pedidos pagos
    const where: any = whereForStore({
      deletedAt: null,
      status: 'PAID'
    }, ctx)

    // Filtro de data
    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)

      where.pagoEm = {
        gte: startDate,
        lte: endDate
      }

      console.log('[admin/reports/traffic-sources] Filtro de data:', {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      })
    }

    console.log('[admin/reports/traffic-sources] Buscando pedidos pagos...')

    // Buscar pedidos com campos de tracking
    const orders = await (prisma as any).order.findMany({
      where,
      orderBy: { pagoEm: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        pagoEm: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        gclid: true,
        fbclid: true,
        referrer: true,
        landingPage: true,
        trafficSourceType: true,
        firstTouchSource: true,
        firstTouchMedium: true,
        firstTouchCampaign: true,
        firstTouchGclid: true,
        firstTouchFbclid: true,
        lastTouchSource: true,
        lastTouchMedium: true,
        lastTouchCampaign: true,
        lastTouchGclid: true,
        lastTouchFbclid: true,
        Customer: {
          select: { email: true, nome: true }
        },
        Produto: {
          select: { nome: true }
        }
      }
    })

    console.log('[admin/reports/traffic-sources] Pedidos encontrados:', orders?.length || 0)

    // Agrupar por canal
    const channels = groupOrdersByChannel(orders)

    // Calcular totais gerais
    const totalRevenue = channels.reduce((sum, c) => sum + c.totalRevenue, 0)
    const totalOrders = channels.reduce((sum, c) => sum + c.orderCount, 0)

    console.log('[admin/reports/traffic-sources] Canais identificados:', channels.length)
    console.log('[admin/reports/traffic-sources] ===== END =====')

    return {
      ok: true,
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageTicket: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null
      },
      channels,
      orders: orders.map(o => ({
        id: o.id,
        totalAmount: o.totalAmount,
        pagoEm: o.pagoEm,
        customerEmail: o.Customer?.email,
        productName: o.Produto?.nome,
        ...classifyTrafficSource(o)
      }))
    }

  } catch (err: any) {
    console.error('[admin/reports/traffic-sources] ===== ERROR =====')
    console.error('[admin/reports/traffic-sources] error:', err)
    console.error('[admin/reports/traffic-sources] message:', err?.message)

    throw createError({
      statusCode: err?.statusCode || 503,
      statusMessage: err?.statusMessage || `Erro: ${err?.message || 'Erro desconhecido'}`
    })
  }
})
