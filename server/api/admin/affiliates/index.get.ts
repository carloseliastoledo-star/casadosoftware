import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  console.log('[admin/affiliates] ===== START =====')
  console.log('[admin/affiliates] NODE_ENV:', process.env.NODE_ENV)
  console.log('[admin/affiliates] DATABASE_URL presente:', !!process.env.DATABASE_URL)
  
  try {
    console.log('[admin/affiliates] Verificando sessão admin...')
    const session = requireAdminSession(event)
    console.log('[admin/affiliates] Admin autenticado:', session?.email)

    console.log('[admin/affiliates] Buscando afiliados...')
    const affiliates = await (prisma as any).affiliate.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, refCode: true, commissionRate: true, isActive: true, createdAt: true }
    })

    console.log('[admin/affiliates] Afiliados encontrados:', affiliates?.length || 0)
    
    if (affiliates?.length > 0) {
      console.log('[admin/affiliates] Sample:', { 
        id: affiliates[0].id, 
        name: affiliates[0].name, 
        email: affiliates[0].email 
      })
    }
    
    console.log('[admin/affiliates] ===== END =====')

    return { ok: true, affiliates }
    
  } catch (err: any) {
    console.error('[admin/affiliates] ===== ERROR =====')
    console.error('[admin/affiliates] error:', err)
    console.error('[admin/affiliates] message:', err?.message)
    console.error('[admin/affiliates] code:', err?.code)
    console.error('[admin/affiliates] meta:', err?.meta)
    
    throw createError({ 
      statusCode: err?.statusCode || 503, 
      statusMessage: err?.statusMessage || `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
