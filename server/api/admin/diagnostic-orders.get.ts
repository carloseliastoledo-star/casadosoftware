import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'

export default defineEventHandler(async (event) => {
  console.log('[diagnostic-orders] ===== DIAGNÓSTICO DE PEDIDOS =====')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  console.log('[diagnostic-orders] Data:', today.toISOString())
  console.log('[diagnostic-orders] STORE_SLUG:', process.env.STORE_SLUG || '(não configurado)')
  
  // Buscar todos os pedidos (sem filtro de data)
  const allOrders = await prisma.order.findMany({
    select: {
      id: true,
      numero: true,
      status: true,
      storeSlug: true,
      criadoEm: true,
      totalAmount: true,
      mercadoPagoPaymentId: true,
      deletedAt: true
    },
    orderBy: { criadoEm: 'desc' },
    take: 100
  })
  
  // Buscar pedidos de hoje
  const todayOrders = await prisma.order.findMany({
    where: {
      criadoEm: { gte: today }
    },
    select: {
      id: true,
      numero: true,
      status: true,
      storeSlug: true,
      criadoEm: true,
      totalAmount: true,
      mercadoPagoPaymentId: true,
      deletedAt: true
    },
    orderBy: { criadoEm: 'desc' },
    take: 50
  })

  const storeSlugCounts: any = {}
  allOrders.forEach((order: any) => {
    const slug = order.storeSlug || '(null)'
    storeSlugCounts[slug] = (storeSlugCounts[slug] || 0) + 1
  })

  // Análise de pedidos excluídos
  const deletedOrders = allOrders.filter((o: any) => o.deletedAt)
  
  // Agrupar por horário de exclusão (mesmo segundo)
  const deletedByTime = deletedOrders.reduce((acc: any, o: any) => {
    const time = o.deletedAt.toISOString().slice(0, 19) // até segundos
    if (!acc[time]) acc[time] = []
    acc[time].push(o)
    return acc
  }, {})

  // Encontrar grupos de exclusão em massa (mesmo horário)
  const bulkDeleteGroups = Object.entries(deletedByTime)
    .filter(([_, orders]: any) => orders.length > 1)
    .map(([time, orders]: any) => ({
      time,
      count: orders.length,
      orderNumbers: orders.map((o: any) => o.numero),
      statuses: orders.map((o: any) => o.status),
      paidCount: orders.filter((o: any) => o.status === 'PAID').length
    }))
    .sort((a: any, b: any) => b.count - a.count)

  console.log('[diagnostic-orders] Pedidos excluídos:', deletedOrders.length)
  console.log('[diagnostic-orders] Grupos de exclusão em massa:', bulkDeleteGroups.length)

  return {
    ok: true,
    environment: {
      storeSlug: process.env.STORE_SLUG || '(não configurado)'
    },
    allOrders: {
      totalOrders: allOrders.length,
      deletedCount: deletedOrders.length,
      storeSlugCounts,
      orders: allOrders.map((order: any) => ({
        id: order.id,
        numero: order.numero,
        status: order.status,
        storeSlug: order.storeSlug || '(null)',
        criadoEm: order.criadoEm.toISOString(),
        totalAmount: order.totalAmount,
        mercadoPagoPaymentId: order.mercadoPagoPaymentId || null,
        deletedAt: order.deletedAt ? order.deletedAt.toISOString() : null
      }))
    },
    today: {
      date: today.toISOString(),
      totalOrders: todayOrders.length,
      orders: todayOrders.map((order: any) => ({
        id: order.id,
        numero: order.numero,
        status: order.status,
        storeSlug: order.storeSlug || '(null)',
        criadoEm: order.criadoEm.toISOString(),
        totalAmount: order.totalAmount,
        mercadoPagoPaymentId: order.mercadoPagoPaymentId || null,
        deletedAt: order.deletedAt ? order.deletedAt.toISOString() : null
      }))
    },
    deletedAnalysis: {
      totalDeleted: deletedOrders.length,
      paidDeleted: deletedOrders.filter((o: any) => o.status === 'PAID').length,
      bulkDeleteGroups,
      deletedOrders: deletedOrders.map((order: any) => ({
        id: order.id,
        numero: order.numero,
        status: order.status,
        storeSlug: order.storeSlug || '(null)',
        criadoEm: order.criadoEm.toISOString(),
        totalAmount: order.totalAmount,
        mercadoPagoPaymentId: order.mercadoPagoPaymentId || null,
        deletedAt: order.deletedAt.toISOString()
      }))
    }
  }
})
