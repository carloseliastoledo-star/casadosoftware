import { defineEventHandler, getRouterParam, createError, setHeader } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'
import { getIntlContext } from '#root/server/utils/intl'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/uploads/')) return raw
  if (raw.startsWith('/')) return raw
  return raw
}

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  setHeader(event, 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

  const slug = String(getRouterParam(event, 'slug') || '').trim().toLowerCase()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })
  }

  const intl = getIntlContext(event)
  const lang = intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : 'pt'

  console.log('[api/categorias/[slug]] ===== START =====')
  console.log('[api/categorias/[slug]] slug:', slug)

  try {
    // Buscar categoria
    const categoria = await (prisma as any).categoria.findFirst({
      where: { slug, ativo: true },
      select: { id: true, nome: true, slug: true, ativo: true }
    })

    console.log('[api/categorias/[slug]] Categoria encontrada:', categoria ? 'SIM' : 'NÃO')

    if (!categoria) {
      throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })
    }

    // Buscar produtos dessa categoria via tabela de junção
    const produtoCategorias = await (prisma as any).produtoCategoria.findMany({
      where: { categoriaId: categoria.id },
      select: { produtoId: true }
    })

    console.log('[api/categorias/[slug]] Produtos na categoria:', produtoCategorias?.length || 0)

    const produtoIds = produtoCategorias.map((pc: any) => pc.produtoId)

    let produtos = []
    if (produtoIds.length > 0) {
      produtos = await (prisma as any).produto.findMany({
        where: { 
          id: { in: produtoIds },
          ativo: true 
        },
        select: {
          id: true,
          nome: true,
          slug: true,
          descricao: true,
          preco: true,
          precoAntigo: true,
          imagem: true,
          criadoEm: true
        },
        orderBy: { criadoEm: 'desc' }
      })
    }

    console.log('[api/categorias/[slug]] Produtos ativos:', produtos?.length || 0)

    const produtosMapeados = produtos.map((p: any) => ({
      id: p.id,
      name: lang === 'en' && p.nomeEn ? p.nomeEn : p.nome,
      slug: p.slug,
      description: lang === 'en' && p.descricaoEn ? p.descricaoEn : p.descricao,
      price: p.preco,
      precoAntigo: p.precoAntigo,
      currency: 'BRL',
      image: normalizeImageUrl(p.imagem),
      createdAt: p.criadoEm
    }))

    console.log('[api/categorias/[slug]] ===== END =====')

    return {
      ok: true,
      categoria: {
        id: categoria.id,
        nome: categoria.nome,
        slug: categoria.slug
      },
      produtos: produtosMapeados
    }

  } catch (error: any) {
    console.error('[api/categorias/[slug]] ===== ERROR =====')
    console.error('[api/categorias/[slug]] error:', error)
    console.error('[api/categorias/[slug]] message:', error?.message)
    console.error('[api/categorias/[slug]] code:', error?.code)
    
    if (error?.statusCode === 404) {
      throw error
    }
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${error?.message || 'Erro desconhecido'}` 
    })
  } finally {
    console.log('[api/categorias/[slug]] loaded in', Date.now() - startedAt, 'ms')
  }
})
