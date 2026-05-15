import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '../../db/prisma.js'

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
    const post = await (prisma as any).blogPost.findFirst({
      where: { 
        slug,
        publicado: true 
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
        atualizadoEm: true
      }
    })
    
    console.log('[api/blog/slug] Post encontrado:', post ? 'SIM' : 'NÃO')
    
    if (!post) {
      console.error('[api/blog/slug] Post não encontrado ou não publicado')
      throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
    }
    
    const normalized = {
      titulo: post.titulo,
      slug: post.slug,
      featuredImage: post.featuredImage,
      excerpt: post.excerpt,
      keyword: post.keyword,
      html: post.html,
      criadoEm: post.criadoEm,
      atualizadoEm: post.atualizadoEm
    }
    
    console.log('[api/blog/slug] ===== END =====')
    return { ok: true, post: normalized }
    
  } catch (err: any) {
    console.error('[api/blog/slug] ===== ERROR =====')
    console.error('[api/blog/slug] full error:', err)
    console.error('[api/blog/slug] message:', err?.message)
    console.error('[api/blog/slug] code:', err?.code)
    console.error('[api/blog/slug] meta:', err?.meta)
    console.error('[api/blog/slug] stack:', err?.stack)
    
    const code = String(err?.code || '')
    const message = String(err?.message || '')
    
    if (code === 'P2021' || message.includes('does not exist')) {
      throw createError({ statusCode: 500, statusMessage: 'Tabela não existe' })
    }
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${message}` 
    })
  }
})
