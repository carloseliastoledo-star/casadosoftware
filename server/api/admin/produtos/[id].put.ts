import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getDefaultProductDescription } from '../../../utils/productDescriptionTemplate'

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

  const imagem = normalizeImageUrl(body.imagem)

  try {
    return await prisma.produto.update({
      where: { id },
      data: {
        nome: body.nome,
        slug: body.slug,
        ...(finalUrl !== undefined ? { finalUrl } : {}),
        preco: Number(body.preco),
        ...(precoAntigoProvided ? { precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo } : {}),
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
        tutorialConteudo: body.tutorialConteudo
      }
    })
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
