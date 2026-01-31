import prisma from '#root/server/db/prisma'
import { getDefaultProductDescription } from '#root/server/utils/productDescriptionTemplate'
import { createError } from 'h3'
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
  const slug = event.context.params?.slug

  const { storeSlug } = getStoreContext()

  const product = await (prisma as any).produto.findUnique({
    where: { slug: String(slug) },
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
      tutorialTitulo: true,
      tutorialSubtitulo: true,
      tutorialConteudo: true,
      criadoEm: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      produtoCategorias: { select: { categoria: { select: { slug: true } } } }
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
  const effectivePrice = override?.preco ?? product.preco
  const effectiveOldPrice = override?.precoAntigo ?? product.precoAntigo

  return {
    id: product.id,
    name: product.nome,
    slug: product.slug,
    finalUrl: product.finalUrl,
    description,
    price: effectivePrice,
    precoAntigo: effectiveOldPrice ?? null,
    image: normalizeImageUrl(product.imagem),
    categories: (product.produtoCategorias || []).map((pc) => pc.categoria?.slug).filter(Boolean),
    tutorialTitle: product.tutorialTitulo,
    tutorialSubtitle: product.tutorialSubtitulo,
    tutorialContent: product.tutorialConteudo,
    createdAt: product.criadoEm
  }
})
