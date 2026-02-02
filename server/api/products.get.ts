import prisma from '#root/server/db/prisma'
import { createError } from 'h3'
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
  try {
    const { storeSlug } = getStoreContext()

    const intl = getIntlContext(event)

    const lang = intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : 'pt'

    const products = await (prisma as any).produto.findMany({
      where: {
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
        cardItems: true,
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
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    return products.map((p: any) => {
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

      const translatedName = autoTranslateText(p.nome, { lang }) || p.nome
      const translatedDescription = autoTranslateText(p.descricao, { lang }) || p.descricao
      const translatedTutorialTitle = autoTranslateText(p.tutorialTitulo, { lang }) || p.tutorialTitulo
      const translatedTutorialSubtitle = autoTranslateText(p.tutorialSubtitulo, { lang }) || p.tutorialSubtitulo

      return {
        id: p.id,
        name: translatedName,
        slug: p.slug,
        description: translatedDescription,
        price: effectivePrice,
        precoAntigo: effectiveOldPrice,
        currency: effective.currency,
        image: normalizeImageUrl(p.imagem),
        cardItems: p.cardItems,
        categories: (p.produtoCategorias || []).map((pc: any) => pc.categoria?.slug).filter(Boolean),
        tutorialTitle: translatedTutorialTitle,
        tutorialSubtitle: translatedTutorialSubtitle,
        createdAt: p.criadoEm
      }
    })
  } catch (err: any) {
    console.error('GET /api/products failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Falha ao carregar produtos'
    })
  }
})
