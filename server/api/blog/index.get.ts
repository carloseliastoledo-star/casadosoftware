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
    const isIntl = storeSlug === 'international'
    const effectiveStoreSlug = isIntl ? 'casadosoftware' : storeSlug

    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true, ...(effectiveStoreSlug ? { storeSlug: effectiveStoreSlug } : {}) },
      orderBy: { criadoEm: 'desc' },
      take: 50,
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        imageAlt: true,
        imageTitle: true,
        imageCaption: true,
        excerpt: true,
        criadoEm: true,
        atualizadoEm: true,
        BlogPostTranslation: isIntl
          ? { where: { lang: 'en' }, select: { titulo: true, excerpt: true, featuredImage: true, imageAlt: true, imageTitle: true, imageCaption: true }, take: 1 }
          : false
      }
    })

    console.log('[api/blog] Query sucesso, posts encontrados:', posts?.length || 0)

    const normalized = Array.isArray(posts)
      ? posts.map((p: any) => {
          const tr = isIntl ? (p?.BlogPostTranslation?.[0] || null) : null
          return {
            titulo: tr?.titulo || p?.titulo || '',
            slug: p?.slug || '',
            featuredImage: tr?.featuredImage || p?.featuredImage || null,
            imageAlt: tr?.imageAlt || p?.imageAlt || null,
            imageTitle: tr?.imageTitle || p?.imageTitle || null,
            imageCaption: tr?.imageCaption || p?.imageCaption || null,
            descricao: tr?.excerpt || p?.excerpt || '',
            criadoEm: p?.criadoEm,
            atualizadoEm: p?.atualizadoEm
          }
        })
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
