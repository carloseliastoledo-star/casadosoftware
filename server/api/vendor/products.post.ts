import { defineEventHandler, readBody, getQuery, createError } from 'h3'
import prisma from '../../db/prisma'
import { verifyVendorToken } from '../../utils/vendorAuth'
import { getDefaultProductDescription } from '../../utils/productDescriptionTemplate'

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
  const q = getQuery(event)
  const email = String((q as any)?.email || '').trim().toLowerCase()
  const token = String((q as any)?.token || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing vendor email' })
  }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })
  }

  const ok = verifyVendorToken(token, email)
  if (!ok.ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const vendor = await (prisma as any).vendor.findUnique({
    where: { email },
    select: { id: true }
  })
  if (!vendor) {
    throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
  }

  const body = await readBody(event)

  const rawDescricao = typeof body.descricao === 'string' ? body.descricao.trim() : ''
  const descricao = rawDescricao ? rawDescricao : getDefaultProductDescription({ nome: body.nome, slug: body.slug })

  const rawFinalUrl = typeof body.finalUrl === 'string' ? body.finalUrl.trim() : ''
  const finalUrl = rawFinalUrl ? rawFinalUrl : null

  const rawPrecoAntigo = body.precoAntigo === null || body.precoAntigo === undefined ? '' : String(body.precoAntigo).trim()
  const precoAntigo = rawPrecoAntigo === '' ? null : Number(rawPrecoAntigo)

  const rawCardItems = typeof body.cardItems === 'string' ? body.cardItems.trim() : ''
  const cardItems = rawCardItems ? rawCardItems : null

  const imagem = normalizeImageUrl(body.imagem)

  if (!body?.nome || !body?.slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing nome/slug' })
  }

  const price = Number(body.preco)
  if (!Number.isFinite(price) || price <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Preço inválido' })
  }

  try {
    const created = await (prisma as any).produto.create({
      data: {
        vendorId: vendor.id,
        nome: body.nome,
        slug: body.slug,
        finalUrl,
        preco: price,
        precoAntigo: precoAntigo === null || Number.isNaN(precoAntigo) ? null : precoAntigo,
        descricao,
        ativo: body.ativo ?? true,
        imagem,
        cardItems
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        preco: true,
        ativo: true,
        criadoEm: true
      }
    })

    return { ok: true, product: created }
  } catch (err: any) {
    const message = String(err?.message || '')
    if (message.toLowerCase().includes('unique') && message.toLowerCase().includes('slug')) {
      throw createError({ statusCode: 409, statusMessage: 'Slug já existe' })
    }
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Server Error' })
  }
})
