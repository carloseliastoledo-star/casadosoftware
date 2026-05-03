import prisma from '#root/server/db/prisma'
import { setHeader } from 'h3'
import { getStoreContext } from '#root/server/utils/store'
import { getIntlContext } from '#root/server/utils/intl'
import { resolveEffectivePrice } from '#root/server/utils/productCurrencyPricing'
import { autoTranslateText } from '#root/server/utils/autoTranslate'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`

  if (raw.startsWith('/uploads/')) return raw

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

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  setHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  try {
    const { storeSlug } = getStoreContext(event)

    const intl = getIntlContext(event)

    const lang = intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : 'pt'

    // Try store-specific first, then any record that has slugs
    const allSettings = await (prisma as any).siteSettings.findMany({
      select: { id: true, storeSlug: true, homeBestSellerSlugs: true }
    })

    let rawSlugsValue: string | null = null

    // 1. Try store-specific record
    if (storeSlug) {
      const match = allSettings.find((s: any) => s.storeSlug === storeSlug && s.homeBestSellerSlugs)
      if (match) rawSlugsValue = match.homeBestSellerSlugs
    }

    // 2. Try legacy (storeSlug null)
    if (!rawSlugsValue) {
      const legacy = allSettings.find((s: any) => s.storeSlug === null && s.homeBestSellerSlugs)
      if (legacy) rawSlugsValue = legacy.homeBestSellerSlugs
    }

    // 3. Fallback: any record with slugs
    if (!rawSlugsValue) {
      const any = allSettings.find((s: any) => s.homeBestSellerSlugs)
      if (any) rawSlugsValue = any.homeBestSellerSlugs
    }

    const manualSlugs = parseSlugs(rawSlugsValue)
    console.log('[best-sellers] storeSlug:', storeSlug, 'records:', allSettings.length, 'manualSlugs:', manualSlugs.length)

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
      precosMoeda: {
        where: { storeSlug: storeSlug || undefined },
        select: { currency: true, amount: true, oldAmount: true }
      },
      produtoCategorias: { select: { categoria: { select: { slug: true } } } },
      tutorialTitulo: true,
      tutorialSubtitulo: true,
      criadoEm: true
    } as const

    const mapProduct = (p: any) => {
      const override = (p as any).precosLoja?.[0] || null

      const effective = resolveEffectivePrice({
        requestedCurrency: intl.currency,
        baseAmount: p.preco,
        baseOldAmount: p.precoAntigo,
        storeAmountOverride: override?.preco,
        storeOldAmountOverride: override?.precoAntigo,
        currencyRows: (p as any).precosMoeda || []
      })

      const effectivePrice = effective.amount
      const effectiveOldPrice = effective.oldAmount

      let translatedName = autoTranslateText(p.nome, { lang }) || p.nome
      if (p.slug === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive') {
        if (lang === 'en') translatedName = 'Original Office 365 License for PC and Mac – Instant Delivery'
        else if (lang === 'es') translatedName = 'Licencia original de Office 365 para PC y Mac – Entrega inmediata'
        else translatedName = 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
      }
      const translatedDescription = autoTranslateText(p.descricao, { lang }) || p.descricao
      const translatedTutorialTitle = autoTranslateText(p.tutorialTitulo, { lang }) || p.tutorialTitulo
      const translatedTutorialSubtitle = autoTranslateText(p.tutorialSubtitulo, { lang }) || p.tutorialSubtitulo

      return {
        id: p.id,
        name: translatedName,
        slug: p.slug,
        description: translatedDescription,
        cardItems: p.cardItems,
        price: effectivePrice,
        precoAntigo: effectiveOldPrice,
        currency: effective.currency,
        image: normalizeImageUrl(p.imagem),
        categories: (p.produtoCategorias || []).map((pc: any) => pc.categoria?.slug).filter(Boolean),
        tutorialTitle: translatedTutorialTitle,
        tutorialSubtitle: translatedTutorialSubtitle,
        createdAt: p.criadoEm
      }
    }

    if (manualSlugs.length > 0) {
      const products = await (prisma as any).produto.findMany({
        where: {
          ativo: true,
          slug: { in: manualSlugs }
        },
        select: productSelect
      })

      const bySlug = new Map(products.map((p: any) => [p.slug, p]))
      const ordered = manualSlugs.map((slug: any) => bySlug.get(slug)).filter(Boolean) as typeof products

      if (ordered.length > 0) {
        return ordered.map(mapProduct)
      }
    }

    const grouped = await (prisma as any).order.groupBy({
      by: ['produtoId'],
      where: { status: 'PAID' },
      _count: { produtoId: true },
      orderBy: { _count: { produtoId: 'desc' } },
      take: 8
    })

    const productIds = grouped.map((g: any) => g.produtoId)
    if (productIds.length === 0) {
      const products = await (prisma as any).produto.findMany({
        where: { ativo: true },
        select: productSelect,
        orderBy: { criadoEm: 'desc' },
        take: 8
      })
      return (products || []).map(mapProduct)
    }

    const products = await (prisma as any).produto.findMany({
      where: { ativo: true, id: { in: productIds } },
      select: productSelect
    })

    const byId = new Map(products.map((p: any) => [p.id, p]))
    const ordered = productIds.map((id: any) => byId.get(id)).filter(Boolean) as typeof products

    return ordered.map(mapProduct)
  } catch (error: any) {
    console.error('[api/products/best-sellers] error:', error)
    return []
  } finally {
    console.log('[api/products/best-sellers] loaded in', Date.now() - startedAt, 'ms')
  }
})
