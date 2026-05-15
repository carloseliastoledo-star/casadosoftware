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
    
    // Query mais simples possível primeiro
    console.log('[admin/orders] Testando query simples...')
    const testOrders = await (prisma as any).order.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' }
    })
    console.log('[admin/orders] Query simples OK, encontrados:', testOrders?.length || 0)
    
    // Agora aplicar filtros
    const where: any = { deletedAt: null }
    
    if (ctx.storeSlug) {
      where.storeSlug = ctx.storeSlug
    }
    
    console.log('[admin/orders] where clause:', JSON.stringify(where))
    
    const orders = await (prisma as any).order.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: 200,
      select: {
        id: true,
        numero: true,
        status: true,
        storeSlug: true,
        criadoEm: true,
        pagoEm: true,
        totalAmount: true,
        deletedAt: true,
        produto: { select: { id: true, nome: true, slug: true } },
        customer: { select: { id: true, email: true, nome: true, whatsapp: true, cpf: true } },
        licencas: { select: { id: true, chave: true, status: true } }
      }
    })
    
    console.log('[admin/orders] Pedidos encontrados:', orders?.length || 0)
    
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
    
    return { ok: true, orders: orders || [], summary }
    
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
