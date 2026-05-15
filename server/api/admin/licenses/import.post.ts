import { defineEventHandler, readBody, createError } from 'h3'
import { randomUUID } from 'node:crypto'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  console.log('[admin/licenses/import] ===== START =====')
  
  try {
    await requireAdminSession(event)

    const { storeSlug } = getStoreContext(event)
    console.log('[admin/licenses/import] storeSlug:', storeSlug || '(null)')

    const body = await readBody(event)
    console.log('[admin/licenses/import] body keys:', Object.keys(body || {}))

    const product_id = String(body?.product_id || '').trim()
    const keysRaw = String(body?.keys || '')
    
    console.log('[admin/licenses/import] product_id:', product_id)
    console.log('[admin/licenses/import] keys length:', keysRaw?.length || 0)

    if (!product_id || !keysRaw) {
      throw createError({ statusCode: 400, statusMessage: 'product_id e keys são obrigatórios' })
    }

    console.log('[admin/licenses/import] Buscando produto...')
    const produto = await (prisma as any).produto.findFirst({
      where: {
        OR: [{ id: product_id }, { slug: product_id }]
      },
      select: { id: true, nome: true }
    })

    console.log('[admin/licenses/import] Produto encontrado:', produto ? 'SIM' : 'NÃO')

    if (!produto) {
      throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
    }

    const licenses = keysRaw
      .split(/\r?\n/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 5)

    console.log('[admin/licenses/import] Licenças válidas:', licenses.length)

    if (licenses.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Nenhuma licença válida encontrada (mínimo 5 caracteres)' })
    }

    const data = licenses.map((key: string) => ({
      id: randomUUID(),
      chave: key,
      status: 'STOCK',
      produtoId: produto.id,
      storeSlug
    }))

    console.log('[admin/licenses/import] Criando licenças...')
    const result = await (prisma as any).licenca.createMany({
      data,
      skipDuplicates: true
    })

    console.log('[admin/licenses/import] Licenças inseridas:', result?.count || 0)
    console.log('[admin/licenses/import] ===== END =====')

    return {
      ok: true,
      inserted: result?.count || 0,
      total: licenses.length
    }
  } catch (err: any) {
    console.error('[admin/licenses/import] ===== ERROR =====')
    console.error('[admin/licenses/import] error:', err)
    console.error('[admin/licenses/import] message:', err?.message)
    console.error('[admin/licenses/import] code:', err?.code)
    console.error('[admin/licenses/import] meta:', err?.meta)
    
    throw createError({ 
      statusCode: err?.statusCode || 503, 
      statusMessage: err?.statusMessage || `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
