import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`

  if (/^([a-z0-9-]+\.)+[a-z]{2,}(\/|$)/i.test(raw)) {
    return `https://${raw}`
  }

  if (raw.startsWith('/')) {
    const baseUrl = String(process.env.WOOCOMMERCE_BASE_URL || '').trim().replace(/\/+$/, '')
    if (!baseUrl) return raw
    return `${baseUrl}${raw}`
  }

  if (/^(wp-content\/|uploads\/)/i.test(raw)) {
    const baseUrl = String(process.env.WOOCOMMERCE_BASE_URL || '').trim().replace(/\/+$/, '')
    if (!baseUrl) return `/${raw}`
    return `${baseUrl}/${raw}`
  }

  if (
    !raw.startsWith('/') &&
    !/^products\//i.test(raw) &&
    !/^public\//i.test(raw) &&
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw)
  ) {
    const baseUrl = String(process.env.WOOCOMMERCE_BASE_URL || '').trim().replace(/\/+$/, '')
    if (!baseUrl) return `/${raw.replace(/^\/+/, '')}`
    return `${baseUrl}/${raw.replace(/^\/+/, '')}`
  }

  return raw
}

function parseSlugs(raw: unknown): string[] {
  const s = String(raw ?? '').trim()
  if (!s) return []

  // try JSON first
  try {
    const parsed = JSON.parse(s)
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => String(x || '').trim())
        .filter(Boolean)
    }
  } catch {
    // ignore
  }

  return s
    .split(/[\n,]+/g)
    .map((x) => x.trim())
    .filter(Boolean)
}

export default defineEventHandler(async () => {
  try {
    const { storeSlug } = getStoreContext()

    const settings = await prisma.siteSettings.findFirst({
      select: { homeBestSellerSlugs: true }
    })

    const manualSlugs = parseSlugs(settings?.homeBestSellerSlugs)

    const productSelect = {
      id: true,
      nome: true,
      slug: true,
      descricao: true,
      cardItems: true,
      preco: true,
      precoAntigo: true,
      imagem: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      produtoCategorias: { select: { categoria: { select: { slug: true } } } },
      tutorialTitulo: true,
      tutorialSubtitulo: true,
      criadoEm: true
    } as const

    if (manualSlugs.length > 0) {
      const products = await (prisma as any).produto.findMany({
        where: {
          ativo: true,
          slug: { in: manualSlugs }
        },
        select: productSelect
      })

      const bySlug = new Map(products.map((p) => [p.slug, p]))
      const ordered = manualSlugs.map((slug) => bySlug.get(slug)).filter(Boolean) as typeof products

      return ordered.map((p) => {
        const override = (p as any).precosLoja?.[0] || null
        const effectivePrice = override?.preco ?? p.preco
        const effectiveOldPrice = override?.precoAntigo ?? p.precoAntigo

        return {
          id: p.id,
          name: p.nome,
          slug: p.slug,
          description: p.descricao,
          cardItems: p.cardItems,
          price: effectivePrice,
          precoAntigo: effectiveOldPrice,
          image: normalizeImageUrl(p.imagem),
          categories: (p.produtoCategorias || []).map((pc) => pc.categoria?.slug).filter(Boolean),
          tutorialTitle: p.tutorialTitulo,
          tutorialSubtitle: p.tutorialSubtitulo,
          createdAt: p.criadoEm
        }
      })
    }

    const grouped = await (prisma as any).order.groupBy({
      by: ['produtoId'],
      where: { status: 'PAID' },
      _count: { produtoId: true },
      orderBy: { _count: { produtoId: 'desc' } },
      take: 8
    })

    const productIds = grouped.map((g) => g.produtoId)
    if (productIds.length === 0) return []

    const products = await (prisma as any).produto.findMany({
      where: { ativo: true, id: { in: productIds } },
      select: productSelect
    })

    const byId = new Map(products.map((p) => [p.id, p]))
    const ordered = productIds.map((id) => byId.get(id)).filter(Boolean) as typeof products

    return ordered.map((p) => {
      const override = (p as any).precosLoja?.[0] || null
      const effectivePrice = override?.preco ?? p.preco
      const effectiveOldPrice = override?.precoAntigo ?? p.precoAntigo

      return {
        id: p.id,
        name: p.nome,
        slug: p.slug,
        description: p.descricao,
        cardItems: p.cardItems,
        price: effectivePrice,
        precoAntigo: effectiveOldPrice,
        image: normalizeImageUrl(p.imagem),
        categories: (p.produtoCategorias || []).map((pc) => pc.categoria?.slug).filter(Boolean),
        tutorialTitle: p.tutorialTitulo,
        tutorialSubtitle: p.tutorialSubtitulo,
        createdAt: p.criadoEm
      }
    })
  } catch (err: any) {
    console.error('GET /api/products/best-sellers failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Falha ao carregar produtos'
    })
  }
})
