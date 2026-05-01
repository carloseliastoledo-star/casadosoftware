import prisma from '#root/server/db/prisma'
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
  setHeader(event, 'Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  try {
    const { storeSlug } = getStoreContext()

    const intl = getIntlContext(event)

    const url = event.node?.req?.url || ''
    const queryString = String(url).split('?')[1] || ''
    const params = new URLSearchParams(queryString)
    const queryLang = String(params.get('lang') || '').trim().toLowerCase()
    const langFromQuery = queryLang === 'en' || queryLang === 'es' || queryLang === 'it' || queryLang === 'fr' ? queryLang : ''

    const lang = langFromQuery || (intl.language === 'en' ? 'en' : intl.language === 'es' ? 'es' : intl.language === 'it' ? 'it' : intl.language === 'fr' ? 'fr' : 'pt')

    const products = await (prisma as any).produto.findMany({
      where: {
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        nomeEn: true,
        nomeEs: true,
        nomeIt: true,
        nomeFr: true,
        slug: true,
        descricao: true,
        descricaoEn: true,
        descricaoEs: true,
        descricaoIt: true,
        descricaoFr: true,
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
        tutorialTituloEn: true,
        tutorialTituloEs: true,
        tutorialTituloIt: true,
        tutorialTituloFr: true,
        tutorialSubtitulo: true,
        tutorialSubtituloEn: true,
        tutorialSubtituloEs: true,
        tutorialSubtituloIt: true,
        tutorialSubtituloFr: true,
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

      const dbName =
        lang === 'en'
          ? p.nomeEn
          : lang === 'es'
            ? p.nomeEs
            : lang === 'it'
              ? p.nomeIt
              : lang === 'fr'
                ? p.nomeFr
                : null

      const dbDescription =
        lang === 'en'
          ? p.descricaoEn
          : lang === 'es'
            ? p.descricaoEs
            : lang === 'it'
              ? p.descricaoIt
              : lang === 'fr'
                ? p.descricaoFr
                : null

      const dbTutorialTitle =
        lang === 'en'
          ? p.tutorialTituloEn
          : lang === 'es'
            ? p.tutorialTituloEs
            : lang === 'it'
              ? p.tutorialTituloIt
              : lang === 'fr'
                ? p.tutorialTituloFr
                : null

      const dbTutorialSubtitle =
        lang === 'en'
          ? p.tutorialSubtituloEn
          : lang === 'es'
            ? p.tutorialSubtituloEs
            : lang === 'it'
              ? p.tutorialSubtituloIt
              : lang === 'fr'
                ? p.tutorialSubtituloFr
                : null

      let translatedName = (typeof dbName === 'string' && dbName.trim()) ? dbName : (autoTranslateText(p.nome, { lang }) || p.nome)
      if (p.slug === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive') {
        if (lang === 'en') translatedName = 'Original Office 365 License for PC and Mac – Instant Delivery'
        else if (lang === 'es') translatedName = 'Licencia original de Office 365 para PC y Mac – Entrega inmediata'
        else translatedName = 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
      }
      const baseDescription = typeof p.descricao === 'string' ? p.descricao : ''
      const translatedDescription = (typeof dbDescription === 'string' && dbDescription.trim()) ? dbDescription : (autoTranslateText(baseDescription, { lang }) || baseDescription)
      const translatedTutorialTitle = (typeof dbTutorialTitle === 'string' && dbTutorialTitle.trim())
        ? dbTutorialTitle
        : (autoTranslateText(p.tutorialTitulo, { lang }) || p.tutorialTitulo)
      const translatedTutorialSubtitle = (typeof dbTutorialSubtitle === 'string' && dbTutorialSubtitle.trim())
        ? dbTutorialSubtitle
        : (autoTranslateText(p.tutorialSubtitulo, { lang }) || p.tutorialSubtitulo)

      const rawCardItems = typeof (p as any).cardItems === 'string' ? String((p as any).cardItems) : ''
      const translatedCardItems = (() => {
        const trimmed = rawCardItems.trim()
        if (!trimmed) return null
        if (lang === 'pt') return trimmed
        const lines = trimmed
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)

        if (!lines.length) return null

        return lines
          .map((line) => autoTranslateText(line, { lang }) || line)
          .join('\n')
      })()

      return {
        id: p.id,
        name: translatedName,
        slug: p.slug,
        description: translatedDescription,
        price: effectivePrice,
        precoAntigo: effectiveOldPrice,
        currency: effective.currency,
        image: normalizeImageUrl(p.imagem),
        cardItems: translatedCardItems,
        categories: (p.produtoCategorias || []).map((pc: any) => pc.categoria?.slug).filter(Boolean),
        tutorialTitle: translatedTutorialTitle,
        tutorialSubtitle: translatedTutorialSubtitle,
        createdAt: p.criadoEm
      }
    })
  } catch (error: any) {
    console.error('[API PRODUCTS ERROR]', error)
    return []
  }
})
