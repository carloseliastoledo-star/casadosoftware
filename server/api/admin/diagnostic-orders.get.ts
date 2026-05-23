import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'

export default defineEventHandler(async (event) => {
  console.log('[diagnostic-orders] ===== DIAGNÓSTICO DE PEDIDOS =====')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  console.log('[diagnostic-orders] Data:', today.toISOString())
  console.log('[diagnostic-orders] STORE_SLUG:', process.env.STORE_SLUG || '(não configurado)')
  
  const orders = await prisma.order.findMany({
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
      mercadoPagoPaymentId: true
    },
    orderBy: { criadoEm: 'desc' },
    take: 50
  })

  const storeSlugCounts: any = {}
  orders.forEach((order: any) => {
    const slug = order.storeSlug || '(null)'
    storeSlugCounts[slug] = (storeSlugCounts[slug] || 0) + 1
  })

  return {
    ok: true,
    environment: {
      storeSlug: process.env.STORE_SLUG || '(não configurado)'
    },
    today: {
      date: today.toISOString(),
      totalOrders: orders.length,
      storeSlugCounts,
      orders: orders.map((order: any) => ({
        id: order.id,
        numero: order.numero,
        status: order.status,
        storeSlug: order.storeSlug || '(null)',
        criadoEm: order.criadoEm.toISOString(),
        totalAmount: order.totalAmount,
        mercadoPagoPaymentId: order.mercadoPagoPaymentId || null
      }))
    }
  }
})
