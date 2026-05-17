import { createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  console.log('[admin/produtos] ===== START =====')
  
  try {
    await requireAdminSession(event)

    const { storeSlug } = getStoreContext(event)
    console.log('[admin/produtos] storeSlug:', storeSlug || '(null)')

    // Admin should show all products regardless of storeSlug (for management purposes)
    // This is different from the public-facing API which filters by store
    const products = await (prisma as any).produto.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
        finalUrl: true,
        preco: true,
        precoAntigo: true,
        imagem: true,
        cardItems: true,
        ativo: true,
        criadoEm: true
      },
      orderBy: { nome: 'asc' }
    })

    console.log('[admin/produtos] Produtos encontrados:', products?.length || 0)
    console.log('[admin/produtos] ===== END =====')

    return products
  } catch (err: any) {
    console.error('[admin/produtos] ===== ERROR =====')
    console.error('[admin/produtos] error:', err)
    console.error('[admin/produtos] message:', err?.message)
    console.error('[admin/produtos] code:', err?.code)
    console.error('[admin/produtos] meta:', err?.meta)
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
