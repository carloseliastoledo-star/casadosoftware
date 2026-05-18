import { createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  console.log('[admin/produtos] ===== START =====')

  try {
    await requireAdminSession(event)

    const { storeSlug } = getStoreContext(event)
    const host = getRequestHeader(event, 'host')
    console.log('[admin/produtos] storeSlug:', storeSlug || '(null)', 'host:', host)

    // Filter products by storeSlug to match edit API behavior
    // Admin should only show products for the current store
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
      where: storeSlug ? { storeSlug } : undefined,
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
