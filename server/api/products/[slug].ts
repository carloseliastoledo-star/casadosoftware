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

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  setHeader(event, 'pragma', 'no-cache')
  setHeader(event, 'expires', '0')

  const rawSlug = event.context.params?.slug

  const { storeSlug } = getStoreContext()

  const intl = getIntlContext(event)
  const lang = intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : 'pt'

  const query = getQuery(event)
  const includeTutorial = String((query as any)?.includeTutorial || '').trim() === '1'

  if (!rawSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug não informado'
    })
  }

  const slug = String(rawSlug)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

  const product = await (prisma as any).produto.findUnique({
    where: { slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      finalUrl: true,
      descricao: true,
      preco: true,
      precoAntigo: true,
      ativo: true,
      imagem: true,
      cardItems: true,
      tutorialTitulo: true,
      tutorialSubtitulo: true,
      tutorialConteudo: true,
      criadoEm: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      precosMoeda: {
        where: { storeSlug: storeSlug || undefined },
        select: { currency: true, amount: true, oldAmount: true }
      }
    }
  })

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

  const override = (product as any).precosLoja?.[0] || null

  const effective = resolveEffectivePrice({
    requestedCurrency: intl.currency,
    baseAmount: product.preco,
    baseOldAmount: product.precoAntigo,
    storeAmountOverride: override?.preco,
    storeOldAmountOverride: override?.precoAntigo,
    currencyRows: (product as any).precosMoeda || []
  })

  const translatedName = autoTranslateText(product.nome, { lang }) || product.nome
  const translatedDescription = autoTranslateText(description, { lang }) || description
  const translatedTutorialTitle = autoTranslateText(product.tutorialTitulo, { lang }) || product.tutorialTitulo
  const translatedTutorialSubtitle = autoTranslateText(product.tutorialSubtitulo, { lang }) || product.tutorialSubtitulo
  const translatedTutorialContent = includeTutorial
    ? (autoTranslateText(product.tutorialConteudo, { lang }) || product.tutorialConteudo)
    : null

  return {
    id: product.id,
    name: translatedName,
    slug: product.slug,
    finalUrl: product.finalUrl,
    description: translatedDescription,
    price: effective.amount,
    precoAntigo: effective.oldAmount ?? null,
    currency: effective.currency,
    image: normalizeImageUrl(product.imagem),
    cardItems: product.cardItems,
    tutorialTitle: translatedTutorialTitle,
    tutorialSubtitle: translatedTutorialSubtitle,
    tutorialContent: translatedTutorialContent,
    createdAt: product.criadoEm
  }
})
