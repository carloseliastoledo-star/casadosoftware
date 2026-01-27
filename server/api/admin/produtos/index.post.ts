import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getDefaultProductDescription } from '../../../utils/productDescriptionTemplate'

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`

  if (raw.startsWith('/')) {
    const baseUrl = String(process.env.WOOCOMMERCE_BASE_URL || '').trim().replace(/\/+$/, '')
    if (!baseUrl) return raw
    return `${baseUrl}${raw}`
  }

  return raw
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

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

  try {
    return await prisma.produto.create({
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
