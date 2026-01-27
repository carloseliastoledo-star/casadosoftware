import prisma from '#root/server/db/prisma'
import { createError } from 'h3'

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

export default defineEventHandler(async () => {
  try {
    const products = await prisma.produto.findMany({
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
        produtoCategorias: { select: { categoria: { select: { slug: true } } } },
        tutorialTitulo: true,
        tutorialSubtitulo: true,
        criadoEm: true
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    return products.map((p) => ({
      id: p.id,
      name: p.nome,
      slug: p.slug,
      description: p.descricao,
      price: p.preco,
      precoAntigo: p.precoAntigo,
      image: normalizeImageUrl(p.imagem),
      cardItems: p.cardItems,
      categories: (p.produtoCategorias || []).map((pc) => pc.categoria?.slug).filter(Boolean),
      tutorialTitle: p.tutorialTitulo,
      tutorialSubtitle: p.tutorialSubtitulo,
      createdAt: p.criadoEm
    }))
  } catch (err: any) {
    console.error('GET /api/products failed', err)
    throw createError({
      statusCode: 500,
      statusMessage: err?.message || 'Falha ao carregar produtos'
    })
  }
})
