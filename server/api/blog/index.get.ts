import { defineEventHandler, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { getStoreContext } from '../../utils/store.js'

export default defineEventHandler(async (event) => {
  console.log('[api/blog] ===== START =====')
  console.log('[api/blog] DATABASE_URL defined:', !!process.env.DATABASE_URL)
  
  try {
    // Query baseada na API admin que funciona
    console.log('[api/blog] Executando query...')
    
    const { storeSlug } = getStoreContext(event)
    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true, storeSlug },
      orderBy: { criadoEm: 'desc' },
      take: 50,
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        excerpt: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })
    
    console.log('[api/blog] Query sucesso, posts encontrados:', posts?.length || 0)
    
    const normalized = Array.isArray(posts)
      ? posts.map((p: any) => ({
          titulo: p?.titulo || '',
          slug: p?.slug || '',
          featuredImage: p?.featuredImage || null,
          descricao: p?.excerpt || '',
          criadoEm: p?.criadoEm,
          atualizadoEm: p?.atualizadoEm
        }))
      : []

    console.log('[api/blog] ===== END =====')
    return { ok: true, posts: normalized }
    
  } catch (err: any) {
    console.error('[api/blog] ===== ERROR =====')
    console.error('[api/blog] full error:', err)
    console.error('[api/blog] message:', err?.message)
    console.error('[api/blog] code:', err?.code)
    console.error('[api/blog] meta:', err?.meta)
    console.error('[api/blog] stack:', err?.stack)
    
    const code = String(err?.code || '')
    const message = String(err?.message || '')
    
    if (code === 'P2021' || message.includes('does not exist')) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Tabela BlogPost não existe no banco' 
      })
    }
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${message}` 
    })
  }
})
