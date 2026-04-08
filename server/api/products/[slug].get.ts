import prisma from '#root/server/db/prisma'
import { getDefaultProductDescription } from '#root/server/utils/productDescriptionTemplate'
import { createError, getQuery, setHeader } from 'h3'
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

function normalizeFinalUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  if (raw === '/') return raw
  return raw.replace(/\/+$/, '')
}

export default defineEventHandler(async (event) => {
  try {
  setHeader(event, 'cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  setHeader(event, 'pragma', 'no-cache')
  setHeader(event, 'expires', '0')

  const rawSlug = event.context.params?.slug

  const { storeSlug } = getStoreContext()

  const intl = getIntlContext(event)

  const query = getQuery(event)
  const includeTutorial = String((query as any)?.includeTutorial || '').trim() === '1'

  const queryLang = String((query as any)?.lang || '').trim().toLowerCase()
  const langFromQuery = queryLang === 'en' || queryLang === 'es' || queryLang === 'it' || queryLang === 'fr' ? queryLang : ''

  const lang = langFromQuery || (intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : intl.language === 'it' ? 'it' : intl.language === 'fr' ? 'fr' : 'pt')

  const slug = String(rawSlug || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

  let product: any
  try {
    product = await (prisma as any).produto.findUnique({
      where: { slug },
      select: {
        id: true,
        nome: true,
        nomeEn: true,
        nomeEs: true,
        nomeIt: true,
        nomeFr: true,
        slug: true,
        finalUrl: true,
        descricao: true,
        descricaoEn: true,
        descricaoEs: true,
        descricaoIt: true,
        descricaoFr: true,
        preco: true,
        precoAntigo: true,
        ativo: true,
        imagem: true,
        tutorialTitulo: true,
        tutorialTituloEn: true,
        tutorialTituloEs: true,
        tutorialTituloIt: true,
        tutorialTituloFr: true,
        tutorialSubtitulo: true,
        tutorialSubtituloEn: true,
        tutorialSubtituloEs: true,
        tutorialSubtituloIt: true,
        tutorialSubtituloFr: true,
        tutorialConteudo: true,
        tutorialConteudoEn: true,
        tutorialConteudoEs: true,
        tutorialConteudoIt: true,
        tutorialConteudoFr: true,
        criadoEm: true,
        precosLoja: {
          where: { storeSlug: storeSlug || undefined },
          select: { preco: true, precoAntigo: true }
        },
        precosMoeda: {
          where: { storeSlug: storeSlug || undefined },
          select: { currency: true, amount: true, oldAmount: true }
        },
        produtoCategorias: { select: { categoria: { select: { slug: true } } } },
        cardItems: true,
        seoTitle: true,
        seoDescription: true,
        seoContent: true
      }
    })
  } catch (dbError: any) {
    console.error('[api][products][slug] db error', dbError?.message || dbError)
    throw createError({
      statusCode: 503,
      statusMessage: 'Serviço temporariamente indisponível'
    })
  }

  if (!product || !product.ativo) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  const rawDescription = typeof product.descricao === 'string' ? product.descricao.trim() : ''
  const description = rawDescription
    ? rawDescription
    : getDefaultProductDescription({ nome: product.nome, slug: product.slug })

  const dbName =
    lang === 'en'
      ? (product as any).nomeEn
      : lang === 'es'
        ? (product as any).nomeEs
        : lang === 'it'
          ? (product as any).nomeIt
          : lang === 'fr'
            ? (product as any).nomeFr
            : null

  const dbDescription =
    lang === 'en'
      ? (product as any).descricaoEn
      : lang === 'es'
        ? (product as any).descricaoEs
        : lang === 'it'
          ? (product as any).descricaoIt
          : lang === 'fr'
            ? (product as any).descricaoFr
            : null

  const dbTutorialTitle =
    lang === 'en'
      ? (product as any).tutorialTituloEn
      : lang === 'es'
        ? (product as any).tutorialTituloEs
        : lang === 'it'
          ? (product as any).tutorialTituloIt
          : lang === 'fr'
            ? (product as any).tutorialTituloFr
            : null

  const dbTutorialSubtitle =
    lang === 'en'
      ? (product as any).tutorialSubtituloEn
      : lang === 'es'
        ? (product as any).tutorialSubtituloEs
        : lang === 'it'
          ? (product as any).tutorialSubtituloIt
          : lang === 'fr'
            ? (product as any).tutorialSubtituloFr
            : null

  const dbTutorialContent =
    lang === 'en'
      ? (product as any).tutorialConteudoEn
      : lang === 'es'
        ? (product as any).tutorialConteudoEs
        : lang === 'it'
          ? (product as any).tutorialConteudoIt
          : lang === 'fr'
            ? (product as any).tutorialConteudoFr
            : null

  let translatedName = (typeof dbName === 'string' && dbName.trim()) ? dbName : (autoTranslateText(product.nome, { lang }) || product.nome)
  if (product.slug === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive') {
    if (lang === 'en') translatedName = 'Original Office 365 License for PC and Mac – Instant Delivery'
    else if (lang === 'es') translatedName = 'Licencia original de Office 365 para PC y Mac – Entrega inmediata'
    else translatedName = 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
  }
  const translatedDescription = (typeof dbDescription === 'string' && dbDescription.trim()) ? dbDescription : (autoTranslateText(description, { lang }) || description)
  const translatedTutorialTitle = (typeof dbTutorialTitle === 'string' && dbTutorialTitle.trim())
    ? dbTutorialTitle
    : (autoTranslateText(product.tutorialTitulo, { lang }) || product.tutorialTitulo)
  const translatedTutorialSubtitle = (typeof dbTutorialSubtitle === 'string' && dbTutorialSubtitle.trim())
    ? dbTutorialSubtitle
    : (autoTranslateText(product.tutorialSubtitulo, { lang }) || product.tutorialSubtitulo)
  const translatedTutorialContent = includeTutorial
    ? ((typeof dbTutorialContent === 'string' && dbTutorialContent.trim()) ? dbTutorialContent : (autoTranslateText(product.tutorialConteudo, { lang }) || product.tutorialConteudo))
    : null

  const rawCardItems = typeof (product as any).cardItems === 'string' ? String((product as any).cardItems) : ''
  const translatedCardItems = (() => {
    if (lang === 'pt' || !rawCardItems.trim()) return rawCardItems
    const lines = rawCardItems
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (!lines.length) return null

    return lines
      .map((line) => autoTranslateText(line, { lang }) || line)
      .join('\n')
  })()

  const override = (product as any).precosLoja?.[0] || null

  const effective = resolveEffectivePrice({
    requestedCurrency: intl.currency,
    baseAmount: product.preco,
    baseOldAmount: product.precoAntigo,
    storeAmountOverride: override?.preco,
    storeOldAmountOverride: override?.precoAntigo,
    currencyRows: (product as any).precosMoeda || []
  })

  const effectivePrice = effective.amount
  const effectiveOldPrice = effective.oldAmount

  return {
    id: product.id,
    name: translatedName,
    slug: product.slug,
    finalUrl: normalizeFinalUrl(product.finalUrl),
    description: translatedDescription,
    price: effectivePrice,
    precoAntigo: effectiveOldPrice ?? null,
    currency: effective.currency,
    image: normalizeImageUrl(product.imagem),
    cardItems: translatedCardItems,
    categories: (product.produtoCategorias || []).map((pc: any) => pc.categoria?.slug).filter(Boolean),
    tutorialTitle: translatedTutorialTitle,
    tutorialSubtitle: translatedTutorialSubtitle,
    tutorialContent: translatedTutorialContent,
    seoTitle: (product as any).seoTitle || null,
    seoDescription: (product as any).seoDescription || null,
    seoContent: (product as any).seoContent || null,
    createdAt: product.criadoEm
  }
  } catch (err: any) {
    if (err?.statusCode) throw err
    console.error('[api][products][slug] unexpected error', err?.message || err)
    throw createError({ statusCode: 503, statusMessage: 'Serviço temporariamente indisponível' })
  }
})
