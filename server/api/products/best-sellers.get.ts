import prisma from '#root/server/db/prisma'
import { setHeader, createError } from 'h3'
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
  setHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

  console.log('[api/products/best-sellers] ===== START =====')
  console.log('[api/products/best-sellers] DATABASE_URL defined:', !!process.env.DATABASE_URL)

  try {
    const { storeSlug } = getStoreContext(event)
    const intl = getIntlContext(event)
    const lang = intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : 'pt'

    // Buscar configurações do site para obter slugs configurados
    const siteSettings = await (prisma as any).siteSettings.findFirst({
      where: storeSlug ? { storeSlug } : { storeSlug: null },
      select: { homeBestSellerSlugs: true }
    })

    // Slugs dos produtos mais vendidos - ler do banco ou usar fallback
    let bestSellerSlugs: string[] = []

    if (siteSettings?.homeBestSellerSlugs) {
      // Parsear slugs do banco (suporta um por linha ou separados por vírgula)
      bestSellerSlugs = siteSettings.homeBestSellerSlugs
        .split(/[\n,]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
      console.log('[api/products/best-sellers] Slugs do banco:', bestSellerSlugs.length)
    } else {
      // Fallback: lista hardcoded se não houver configuração
      bestSellerSlugs = [
        "microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive",
        "office-365",
        "microsoft-windows-11-pro-chave-esd-32-64-bits",
        "microsoft-windows-10-pro-chave-esd-32-64-bits",
        "microsoft-office-365-pcs-mac-ios-e-android",
        "microsoft-windows-10-pro-1-licenca",
        "office-2021-pro-plus-windows-11-pro",
        "microsoft-office-365-vitalicio-microsoft-windows-11-pro-1-licenca",
        "office-ltsc-pro-plus-2024",
        "winserver2025"
      ]
      console.log('[api/products/best-sellers] Usando slugs fallback')
    }

    console.log('[api/products/best-sellers] Buscando produtos...')
    
    // Query simples com campos que existem no model Produto
    // Apenas aplicar filtro de loja se storeSlug estiver configurado
    // Para casadosoftware.com.br (storeSlug null), não filtrar por ProdutoPrecoLoja
    const produtos = await (prisma as any).produto.findMany({
      where: {
        ativo: true,
        slug: { in: bestSellerSlugs },
        ...(storeSlug ? { ProdutoPrecoLoja: { some: { storeSlug } } } : {})
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        descricao: true,
        preco: true,
        precoAntigo: true,
        imagem: true,
        tutorialTitulo: true,
        tutorialSubtitulo: true,
        criadoEm: true,
        ativo: true
      }
    })

    console.log('[api/products/best-sellers] Produtos encontrados:', produtos?.length || 0)

    if (!produtos || produtos.length === 0) {
      console.log('[api/products/best-sellers] Nenhum produto encontrado')
      return []
    }

    // Criar mapa de produtos por slug para ordenação correta
    const produtoMap = new Map(produtos.map((p: any) => [p.slug, p]))

    // Ordenar produtos na mesma ordem dos slugs configurados
    const orderedProdutos = bestSellerSlugs
      .map((slug: string) => produtoMap.get(slug))
      .filter((p: any) => p) // Remover nulls (produtos não encontrados)

    // Mapear para o formato esperado pelo frontend
    const products = orderedProdutos.map((p: any) => ({
      id: p.id,
      name: lang === 'en' && p.nomeEn ? p.nomeEn : 
            lang === 'es' && p.nomeEs ? p.nomeEs : p.nome,
      slug: p.slug,
      description: lang === 'en' && p.descricaoEn ? p.descricaoEn :
                   lang === 'es' && p.descricaoEs ? p.descricaoEs : p.descricao,
      price: p.preco,
      precoAntigo: p.precoAntigo,
      currency: 'BRL',
      image: normalizeImageUrl(p.imagem),
      categories: [],
      tutorialTitle: lang === 'en' && p.tutorialTituloEn ? p.tutorialTituloEn :
                     lang === 'es' && p.tutorialTituloEs ? p.tutorialTituloEs : p.tutorialTitulo,
      tutorialSubtitle: lang === 'en' && p.tutorialSubtituloEn ? p.tutorialSubtituloEn :
                        lang === 'es' && p.tutorialSubtituloEs ? p.tutorialSubtituloEs : p.tutorialSubtitulo,
      createdAt: p.criadoEm
    }))

    console.log('[api/products/best-sellers] ===== END =====')
    console.log('[api/products/best-sellers] loaded in', Date.now() - startedAt, 'ms')
    
    return products

  } catch (error: any) {
    console.error('[api/products/best-sellers] ===== ERROR =====')
    console.error('[api/products/best-sellers] error:', error)
    console.error('[api/products/best-sellers] message:', error?.message)
    console.error('[api/products/best-sellers] code:', error?.code)
    console.error('[api/products/best-sellers] meta:', error?.meta)
    
    throw createError({ 
      statusCode: 503, 
      statusMessage: `Erro: ${error?.message || 'Erro desconhecido'}` 
    })
  }
})
