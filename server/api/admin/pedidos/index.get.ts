import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'
import { getStoreContext } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  console.log('[admin/orders] ===== START =====')
  
  try {
    await requireAdminSession(event)
    
    console.log('[admin/orders] DATABASE_URL defined:', !!process.env.DATABASE_URL)
    
    const ctx = getStoreContext(event)
    console.log('[admin/orders] storeSlug:', ctx.storeSlug || '(null)')
    
    const q = getQuery(event)
    console.log('[admin/orders] query params:', JSON.stringify(q))
    
    // Query com includes de Customer, Produto e Licenca
    const where: any = { deletedAt: null }
    
    console.log('[admin/orders] where clause:', JSON.stringify(where))
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
      licencas: o.Licenca
    }))
    
    // Summary
    const summaryAgg = await (prisma as any).order.aggregate({
      where: { ...where, status: 'PAID' },
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
