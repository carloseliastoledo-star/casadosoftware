import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getDefaultProductDescription } from '../../../utils/productDescriptionTemplate'
import { getStoreContext } from '#root/server/utils/store'

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
  requireAdminSession(event)

  const { storeSlug } = getStoreContext()

  const id = event.context.params.id
  const body = await readBody(event)

  const hasGoogleAds = Boolean(body.googleAdsConversionLabel)

  const finalUrlProvided = typeof body.finalUrl === 'string'
  const rawFinalUrl = finalUrlProvided ? body.finalUrl.trim() : ''
  const finalUrl = finalUrlProvided ? (rawFinalUrl ? rawFinalUrl : null) : undefined

  const descricaoProvided = typeof body.descricao === 'string'
  const rawDescricao = descricaoProvided ? body.descricao.trim() : ''

  let descricao: string | undefined
  if (descricaoProvided) {
    descricao = rawDescricao ? rawDescricao : getDefaultProductDescription({ nome: body.nome, slug: body.slug })
  } else {
    descricao = undefined
  }

  const categoriasProvided = Array.isArray(body.categorias)
  const categorias = categoriasProvided ? body.categorias.map((s: any) => String(s).trim()).filter(Boolean) : []

  const precoAntigoProvided = body.precoAntigo !== undefined
  const rawPrecoAntigo = body.precoAntigo === null || body.precoAntigo === undefined ? '' : String(body.precoAntigo).trim()
  const precoAntigo = rawPrecoAntigo === '' ? null : Number(rawPrecoAntigo)

  const cardItemsProvided = body.cardItems !== undefined
  const rawCardItems = body.cardItems === null || body.cardItems === undefined ? '' : String(body.cardItems).trim()
  const cardItems = rawCardItems === '' ? null : rawCardItems

  const precoUsdProvided = body.precoUsd !== undefined
  const rawPrecoUsd = body.precoUsd === null || body.precoUsd === undefined ? '' : String(body.precoUsd).trim()
  const precoUsd = rawPrecoUsd === '' ? null : Number(rawPrecoUsd)

  const precoEurProvided = body.precoEur !== undefined
  const rawPrecoEur = body.precoEur === null || body.precoEur === undefined ? '' : String(body.precoEur).trim()
  const precoEur = rawPrecoEur === '' ? null : Number(rawPrecoEur)

  const imagem = normalizeImageUrl(body.imagem)

  try {
    const updated = await (prisma as any).produto.update({
      where: { id },
      data: {
        nome: body.nome,
        slug: body.slug,
        ...(finalUrl !== undefined ? { finalUrl } : {}),
        ...(descricao !== undefined ? { descricao } : {}),
        ativo: body.ativo,
        imagem,
        ...(cardItemsProvided ? { cardItems } : {}),
        ...(categoriasProvided
          ? {
              produtoCategorias: {
                deleteMany: {},
                create: categorias.map((slug: string) => ({
                  categoria: { connect: { slug } }
                }))
              }
            }
          : {}),
        ...(hasGoogleAds
          ? {
              googleAdsConversionLabel: body.googleAdsConversionLabel,
              googleAdsConversionValue:
                body.googleAdsConversionValue === null || body.googleAdsConversionValue === undefined || body.googleAdsConversionValue === ''
                  ? null
                  : Number(body.googleAdsConversionValue),
              googleAdsConversionCurrency: body.googleAdsConversionCurrency || 'BRL'
            }
          : {}),
        tutorialTitulo: body.tutorialTitulo,
        tutorialSubtitulo: body.tutorialSubtitulo,
        tutorialConteudo: body.tutorialConteudo,
        ...(storeSlug ? {} : { preco: Number(body.preco) }),
        ...(storeSlug || !precoAntigoProvided
          ? {}
          : { precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo })
      }
    })

    if (storeSlug) {
      await (prisma as any).produtoPrecoLoja.upsert({
        where: { produtoId_storeSlug: { produtoId: id, storeSlug } },
        create: {
          id: crypto.randomUUID(),
          produtoId: id,
          storeSlug,
          preco: Number(body.preco),
          precoAntigo: precoAntigoProvided ? (precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo) : null,
          updatedAt: new Date()
        },
        update: {
          preco: Number(body.preco),
          ...(precoAntigoProvided ? { precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo } : {}),
          updatedAt: new Date()
        }
      })

      if (precoUsdProvided) {
        if (precoUsd !== null && Number.isFinite(precoUsd) && precoUsd > 0) {
          await (prisma as any).produtoPrecoMoeda.upsert({
            where: { produtoId_storeSlug_currency: { produtoId: id, storeSlug, currency: 'usd' } },
            create: {
              id: crypto.randomUUID(),
              produtoId: id,
              storeSlug,
              currency: 'usd',
              amount: precoUsd,
              oldAmount: null,
              updatedAt: new Date()
            },
            update: {
              amount: precoUsd,
              updatedAt: new Date()
            }
          })
        } else {
          await (prisma as any).produtoPrecoMoeda.deleteMany({
            where: { produtoId: id, storeSlug, currency: 'usd' }
          })
        }
      }

      if (precoEurProvided) {
        if (precoEur !== null && Number.isFinite(precoEur) && precoEur > 0) {
          await (prisma as any).produtoPrecoMoeda.upsert({
            where: { produtoId_storeSlug_currency: { produtoId: id, storeSlug, currency: 'eur' } },
            create: {
              id: crypto.randomUUID(),
              produtoId: id,
              storeSlug,
              currency: 'eur',
              amount: precoEur,
              oldAmount: null,
              updatedAt: new Date()
            },
            update: {
              amount: precoEur,
              updatedAt: new Date()
            }
          })
        } else {
          await (prisma as any).produtoPrecoMoeda.deleteMany({
            where: { produtoId: id, storeSlug, currency: 'eur' }
          })
        }
      }
    }

    return updated
  } catch (err: any) {
    const message = String(err?.message || '')
    throw createError({
      statusCode: message.includes('provided value for the column is too long') && message.includes('Column: descricao') ? 400 : 500,
      statusMessage: message.includes('provided value for the column is too long') && message.includes('Column: descricao')
        ? 'A descrição está muito grande para o limite do banco atual. Aplique a migração para aumentar o campo (descricao -> TEXT).'
        : (message.includes('Unknown column')
            ? 'Banco de dados desatualizado (migração pendente). Rode as migrations em produção.'
            : (err?.message || 'Server Error'))
    })
  }
})
