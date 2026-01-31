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

  const body = await readBody(event)

  const hasGoogleAds = Boolean(body.googleAdsConversionLabel)

  const rawDescricao = typeof body.descricao === 'string' ? body.descricao.trim() : ''
  const descricao = rawDescricao ? rawDescricao : getDefaultProductDescription({ nome: body.nome, slug: body.slug })

  const rawFinalUrl = typeof body.finalUrl === 'string' ? body.finalUrl.trim() : ''
  const finalUrl = rawFinalUrl ? rawFinalUrl : null

  const rawPrecoAntigo = body.precoAntigo === null || body.precoAntigo === undefined ? '' : String(body.precoAntigo).trim()
  const precoAntigo = rawPrecoAntigo === '' ? null : Number(rawPrecoAntigo)

  const rawCardItems = typeof body.cardItems === 'string' ? body.cardItems.trim() : ''
  const cardItems = rawCardItems ? rawCardItems : null

  const imagem = normalizeImageUrl(body.imagem)

  const categorias = Array.isArray(body.categorias) ? body.categorias.map((s: any) => String(s).trim()).filter(Boolean) : []

  const rawPrecoUsd = body.precoUsd === null || body.precoUsd === undefined ? '' : String(body.precoUsd).trim()
  const precoUsd = rawPrecoUsd === '' ? null : Number(rawPrecoUsd)

  const rawPrecoEur = body.precoEur === null || body.precoEur === undefined ? '' : String(body.precoEur).trim()
  const precoEur = rawPrecoEur === '' ? null : Number(rawPrecoEur)

  try {
    const created = await (prisma as any).produto.create({
      data: {
        nome: body.nome,
        slug: body.slug,
        finalUrl,
        preco: Number(body.preco),
        precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo,
        descricao,
        ativo: body.ativo ?? true,
        imagem,
        cardItems,
        ...(categorias.length
          ? {
              produtoCategorias: {
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
        tutorialConteudo: body.tutorialConteudo
      }
    })

    if (storeSlug) {
      await (prisma as any).produtoPrecoLoja.upsert({
        where: { produtoId_storeSlug: { produtoId: created.id, storeSlug } },
        create: {
          id: crypto.randomUUID(),
          produtoId: created.id,
          storeSlug,
          preco: Number(body.preco),
          precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo,
          updatedAt: new Date()
        },
        update: {
          preco: Number(body.preco),
          precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo,
          updatedAt: new Date()
        }
      })

      if (precoUsd !== null && Number.isFinite(precoUsd) && precoUsd > 0) {
        await (prisma as any).produtoPrecoMoeda.upsert({
          where: { produtoId_storeSlug_currency: { produtoId: created.id, storeSlug, currency: 'usd' } },
          create: {
            id: crypto.randomUUID(),
            produtoId: created.id,
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
      }

      if (precoEur !== null && Number.isFinite(precoEur) && precoEur > 0) {
        await (prisma as any).produtoPrecoMoeda.upsert({
          where: { produtoId_storeSlug_currency: { produtoId: created.id, storeSlug, currency: 'eur' } },
          create: {
            id: crypto.randomUUID(),
            produtoId: created.id,
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
      }
    }

    return created
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
