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

function htmlToPlainText(input: unknown): string {
  let s = String(input ?? '')
  if (!s.trim()) return ''

  // normalize line breaks from common tags
  s = s
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n')
    .replace(/<\s*p\b[^>]*>/gi, '')
    .replace(/<\s*\/\s*div\s*>/gi, '\n')
    .replace(/<\s*div\b[^>]*>/gi, '')
    .replace(/<\s*\/\s*li\s*>/gi, '\n')
    .replace(/<\s*li\b[^>]*>/gi, '- ')

  // strip remaining tags
  s = s.replace(/<[^>]+>/g, '')

  // decode minimal HTML entities
  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')

  // cleanup whitespace
  s = s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim()

  return s
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

async function upsertCategoriaByWoo(input: { wcCategoryId: number; nome: string; slug: string }) {
  const baseSlug = input.slug

  try {
    await prisma.categoria.upsert({
      where: { wcCategoryId: input.wcCategoryId },
      create: {
        wcCategoryId: input.wcCategoryId,
        nome: input.nome,
        slug: baseSlug
      },
      update: {
        nome: input.nome,
        slug: baseSlug
      },
      select: { id: true }
    })
    return
  } catch (err: any) {
    if (String(err?.code || '') !== 'P2002') throw err

    // slug já existe. Reaproveitar categoria existente por slug.
    const existingBySlug = await prisma.categoria.findUnique({ where: { slug: baseSlug }, select: { id: true, wcCategoryId: true } })
    if (existingBySlug) {
      // se não estiver associada, associa; se estiver associada a outra, não muda.
      if (!existingBySlug.wcCategoryId || existingBySlug.wcCategoryId === input.wcCategoryId) {
        await prisma.categoria.update({
          where: { id: existingBySlug.id },
          data: {
            wcCategoryId: input.wcCategoryId,
            nome: input.nome
          },
          select: { id: true }
        })
        return
      }
    }

    // fallback: gerar slug único
    const uniqueSlug = `${baseSlug}-${input.wcCategoryId}`
    await prisma.categoria.upsert({
      where: { wcCategoryId: input.wcCategoryId },
      create: {
        wcCategoryId: input.wcCategoryId,
        nome: input.nome,
        slug: uniqueSlug
      },
      update: {
        nome: input.nome,
        slug: uniqueSlug
      },
      select: { id: true }
    })
  }
}

async function upsertProdutoByWoo(input: {
  wcProductId: number
  nome: string
  slug: string
  preco: number
  descricao: string | null
  imagem: string | null
  finalUrl: string | null
  categoriaIds: string[]
}) {
  const baseSlug = input.slug

  const makeProdutoData = (slug: string) => ({
    wcProductId: input.wcProductId,
    nome: input.nome,
    slug,
    finalUrl: input.finalUrl,
    preco: input.preco,
    descricao: input.descricao,
    imagem: input.imagem,
    ativo: true
  })

  const makeCategoriasRelation = () => ({
    produtoCategorias: {
      deleteMany: {},
      ...(input.categoriaIds.length
        ? {
            create: input.categoriaIds.map((id) => ({
              categoria: { connect: { id } }
            }))
          }
        : {})
    }
  })

  try {
    await prisma.produto.upsert({
      where: { wcProductId: input.wcProductId },
      create: {
        ...makeProdutoData(baseSlug),
        ...(input.categoriaIds.length
          ? {
              produtoCategorias: {
                create: input.categoriaIds.map((id) => ({
                  categoria: { connect: { id } }
                }))
              }
            }
          : {})
      },
      update: {
        ...makeProdutoData(baseSlug),
        ...makeCategoriasRelation()
      },
      select: { id: true }
    })
    return
  } catch (err: any) {
    if (String(err?.code || '') !== 'P2002') throw err

    const existingBySlug = await prisma.produto.findUnique({ where: { slug: baseSlug }, select: { id: true, wcProductId: true } })
    if (existingBySlug) {
      if (!existingBySlug.wcProductId || existingBySlug.wcProductId === input.wcProductId) {
        await prisma.produto.update({
          where: { id: existingBySlug.id },
          data: {
            ...makeProdutoData(baseSlug),
            ...makeCategoriasRelation()
          },
          select: { id: true }
        })
        return
      }
    }

    const uniqueSlug = `${baseSlug}-${input.wcProductId}`
    await prisma.produto.upsert({
      where: { wcProductId: input.wcProductId },
      create: {
        ...makeProdutoData(uniqueSlug),
        ...(input.categoriaIds.length
          ? {
              produtoCategorias: {
                create: input.categoriaIds.map((id) => ({
                  categoria: { connect: { id } }
                }))
              }
            }
          : {})
      },
      update: {
        ...makeProdutoData(uniqueSlug),
        ...makeCategoriasRelation()
      },
      select: { id: true }
    })
  }
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

        await upsertCategoriaByWoo({ wcCategoryId: Number(c.id), nome, slug })

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

        const rawDescricaoHtml = String(p?.description || p?.short_description || '').trim()
        const descricaoText = htmlToPlainText(rawDescricaoHtml)
        const descricao = descricaoText || null

        const imagem = Array.isArray(p?.images) && p.images.length > 0 ? String(p.images[0]?.src || '').trim() : ''
        const imagemUrl = imagem || null

        const rawFinalUrl = String((p as any)?.permalink || (p as any)?.link || '').trim()
        const finalUrl = rawFinalUrl || null

        const existing = await prisma.produto.findUnique({ where: { wcProductId }, select: { id: true } })

        // categorias do produto
        const catIds = (Array.isArray(p?.categories) ? p.categories : [])
          .map((c: any) => Number(c?.id))
          .filter((n: number) => Number.isFinite(n))

        const categoriasDb = catIds.length
          ? await prisma.categoria.findMany({ where: { wcCategoryId: { in: catIds } }, select: { id: true } })
          : []

        await upsertProdutoByWoo({
          wcProductId,
          nome,
          slug,
          preco,
          descricao,
          imagem: imagemUrl,
          finalUrl,
          categoriaIds: categoriasDb.map((c) => c.id)
        })

        if (existing) updatedProducts++
        else createdProducts++

        processedProducts++

        // se chegou aqui, o upsert deu certo
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
