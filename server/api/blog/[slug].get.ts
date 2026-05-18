import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../db/prisma.js'
import { getStoreContext } from '../../utils/store.js'

export default defineEventHandler(async (event) => {
  console.log('[api/blog/slug] ===== START =====')
  
  const slug = getRouterParam(event, 'slug')
  console.log('[api/blog/slug] slug:', slug)
  console.log('[api/blog/slug] DATABASE_URL defined:', !!process.env.DATABASE_URL)
  
  if (!slug) {
    console.error('[api/blog/slug] slug não fornecido')
    throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })
  }

  try {
    // Query simples primeiro
    console.log('[api/blog/slug] Buscando post...')
    const { storeSlug } = getStoreContext(event)
    const isIntl = storeSlug === 'international'
    const effectiveStoreSlug = isIntl ? 'casadosoftware' : storeSlug

    const post = await (prisma as any).blogPost.findFirst({
      where: {
        slug,
        publicado: true,
        ...(effectiveStoreSlug ? { storeSlug: effectiveStoreSlug } : {})
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        featuredImage: true,
        excerpt: true,
        keyword: true,
        html: true,
        criadoEm: true,
        atualizadoEm: true,
        BlogPostTranslation: isIntl
          ? { where: { lang: 'en' }, select: { titulo: true, excerpt: true, featuredImage: true, html: true }, take: 1 }
          : false
      }
    })
    
    console.log('[api/blog/slug] Post encontrado:', post ? 'SIM' : 'NÃO')
    
    if (!post) {
      console.error('[api/blog/slug] Post não encontrado ou não publicado')
      throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
    }
    
    const tr = isIntl ? (post.BlogPostTranslation?.[0] || null) : null
    const normalized = {
      titulo: tr?.titulo || post.titulo,
      slug: post.slug,
      featuredImage: tr?.featuredImage || post.featuredImage,
      excerpt: tr?.excerpt || post.excerpt,
      keyword: post.keyword,
      html: tr?.html || post.html,
      criadoEm: post.criadoEm,
      atualizadoEm: post.atualizadoEm
    }
    
    console.log('[api/blog/slug] ===== END =====')
    return { ok: true, post: normalized }
    
  } catch (err: any) {
    console.error('[api/blog/slug] ===== ERROR =====')
    console.error('[api/blog/slug] full error:', err)
    
    // Se já é um erro 404, propaga
    if (err?.statusCode === 404) {
      throw err
    }
    
    // Para qualquer outro erro, retorna 404 para não expor erros internos aos bots
    throw createError({ 
      statusCode: 404, 
      statusMessage: 'Post não encontrado'
    })
  }
})
