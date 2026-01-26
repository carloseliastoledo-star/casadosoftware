import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../../db/prisma'
import { requireAdminSession } from '../../../../utils/adminSession'
import { wooGetProductCategories, wooGetProducts } from '../../../../utils/woocommerceClient'

const STATE_KEY = 'woo_products'

function parseMoney(input: unknown): number {
  const raw = typeof input === 'string' ? input : String(input ?? '')
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function toSlug(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  try {
    const body = await readBody(event)

    const pagesPerRunRaw = Number(body?.pagesPerRun ?? 3)
    const pagesPerRun = Number.isFinite(pagesPerRunRaw) ? Math.max(1, Math.min(25, Math.floor(pagesPerRunRaw))) : 3

    const perPageRaw = Number(body?.perPage ?? 100)
    const perPage = Number.isFinite(perPageRaw) ? Math.max(10, Math.min(100, Math.floor(perPageRaw))) : 100

    const forceRestart = Boolean(body?.forceRestart)

    let state = await prisma.wooImportState.findUnique({ where: { key: STATE_KEY } })

    if (!state || forceRestart) {
      state = await prisma.wooImportState.upsert({
        where: { key: STATE_KEY },
        create: {
          key: STATE_KEY,
          resource: 'products',
          after: null,
          nextPage: 1,
          done: false
        },
        update: {
          resource: 'products',
          after: null,
          nextPage: 1,
          done: false
        }
      })
    }

    if (state.done) {
      return {
        ok: true,
        done: true,
        nextPage: state.nextPage,
        processedCategories: 0,
        upsertedCategories: 0,
        processedProducts: 0,
        createdProducts: 0,
        updatedProducts: 0
      }
    }

    let processedCategories = 0
    let upsertedCategories = 0
    let processedProducts = 0
    let createdProducts = 0
    let updatedProducts = 0

    // 1) Importar categorias (sempre, antes dos produtos)
    for (let page = 1; page <= 1000; page++) {
      const cats = await wooGetProductCategories({ page, per_page: 100 })
      if (!cats || cats.length === 0) break

      for (const c of cats) {
        const nome = String(c?.name || '').trim()
        const slug = toSlug(c?.slug || nome)
        if (!nome || !slug || !Number.isFinite(Number(c?.id))) {
          continue
        }

        await prisma.categoria.upsert({
          where: { wcCategoryId: Number(c.id) },
          create: {
            wcCategoryId: Number(c.id),
            nome,
            slug
          },
          update: {
            nome,
            slug
          },
          select: { id: true }
        })

        processedCategories++
        upsertedCategories++
      }
    }

    // 2) Importar produtos por páginas (com estado)
    let page = state.nextPage

    for (let i = 0; i < pagesPerRun; i++) {
      const products = await wooGetProducts({ page, per_page: perPage })

      if (!products || products.length === 0) {
        state = await prisma.wooImportState.update({
          where: { key: STATE_KEY },
          data: { done: true }
        })
        break
      }

      for (const p of products) {
        const wcProductId = Number(p?.id)
        if (!Number.isFinite(wcProductId)) continue

        const nome = String(p?.name || '').trim()
        if (!nome) continue

        const slug = toSlug(p?.slug || nome)
        if (!slug) continue

        const preco = parseMoney(p?.price ?? p?.regular_price)

        const rawDescricao = String(p?.description || p?.short_description || '').trim()
        const descricao = rawDescricao || null

        const imagem = Array.isArray(p?.images) && p.images.length > 0 ? String(p.images[0]?.src || '').trim() : ''
        const imagemUrl = imagem || null

        const existing = await prisma.produto.findUnique({ where: { wcProductId }, select: { id: true } })

        // categorias do produto
        const catIds = (Array.isArray(p?.categories) ? p.categories : [])
          .map((c: any) => Number(c?.id))
          .filter((n: number) => Number.isFinite(n))

        const categoriasDb = catIds.length
          ? await prisma.categoria.findMany({ where: { wcCategoryId: { in: catIds } }, select: { id: true } })
          : []

        const produto = await prisma.produto.upsert({
          where: { wcProductId },
          create: {
            wcProductId,
            nome,
            slug,
            preco,
            descricao,
            imagem: imagemUrl,
            ativo: true,
            ...(categoriasDb.length
              ? {
                  produtoCategorias: {
                    create: categoriasDb.map((c) => ({
                      categoria: { connect: { id: c.id } }
                    }))
                  }
                }
              : {})
          },
          update: {
            nome,
            slug,
            preco,
            descricao,
            imagem: imagemUrl,
            ativo: true,
            produtoCategorias: {
              deleteMany: {},
              ...(categoriasDb.length
                ? {
                    create: categoriasDb.map((c) => ({
                      categoria: { connect: { id: c.id } }
                    }))
                  }
                : {})
            }
          },
          select: { id: true }
        })

        if (existing) updatedProducts++
        else createdProducts++

        processedProducts++

        if (!produto?.id) {
          throw createError({ statusCode: 500, statusMessage: 'Falha ao upsert produto' })
        }
      }

      page++

      state = await prisma.wooImportState.update({
        where: { key: STATE_KEY },
        data: { nextPage: page }
      })
    }

    return {
      ok: true,
      done: state.done,
      nextPage: state.nextPage,
      processedCategories,
      upsertedCategories,
      processedProducts,
      createdProducts,
      updatedProducts
    }
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || err?.status || 500)
    const statusMessage = String(err?.statusMessage || err?.data?.statusMessage || err?.message || 'Server Error')

    if (statusMessage.includes('WooCommerce não configurado')) {
      throw createError({ statusCode: 500, statusMessage })
    }

    if (statusCode === 401 || statusCode === 403 || statusMessage.toLowerCase().includes('unauthorized')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'WooCommerce: acesso negado (401/403). Confira WOOCOMMERCE_CONSUMER_KEY/WOOCOMMERCE_CONSUMER_SECRET e permissões da chave (Read).'
      })
    }

    if (statusMessage.includes('Unknown column') || statusMessage.includes('wcProductId') || statusMessage.includes('wcCategoryId')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Banco de dados desatualizado (migração pendente). Aplique as migrations em produção e tente novamente.'
      })
    }

    throw createError({ statusCode: 500, statusMessage })
  }
})
