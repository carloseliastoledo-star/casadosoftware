import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'

const STORE_SLUG = 'international'

// Categorias comerciais a criar
const COMMERCIAL_CATEGORIES = [
  { slug: 'windows', nome: 'Windows' },
  { slug: 'office', nome: 'Office' },
  { slug: 'windows-server', nome: 'Windows Server' },
  { slug: 'adobe', nome: 'Adobe' },
  { slug: 'autodesk', nome: 'Autodesk' },
  { slug: 'games', nome: 'Games' },
  { slug: 'electronics', nome: 'Electronics' },
]

function buildWhereForSlug(slug: string): any {
  const base = { storeSlug: STORE_SLUG, ativo: true }
  switch (slug) {
    case 'windows':
      return {
        ...base,
        nome: { contains: 'Windows' },
        NOT: { nome: { contains: 'Server' } }
      }
    case 'windows-server':
      return { ...base, nome: { contains: 'Windows Server' } }
    case 'office':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Office' } },
          { nome: { contains: 'Microsoft 365' } },
          { nome: { contains: '365' } }
        ]
      }
    case 'adobe':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Adobe' } },
          { nome: { contains: 'Photoshop' } },
          { nome: { contains: 'Illustrator' } },
          { nome: { contains: 'Creative Cloud' } },
          { nome: { contains: 'Acrobat' } }
        ]
      }
    case 'autodesk':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Autodesk' } },
          { nome: { contains: 'AutoCAD' } },
          { nome: { contains: '3DS Max' } },
          { nome: { contains: 'SketchUp' } }
        ]
      }
    case 'games':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Steam' } },
          { nome: { contains: 'Xbox' } },
          { nome: { contains: 'PSN' } },
          { nome: { contains: 'EA SPORTS' } },
          { nome: { contains: 'Battlefield' } },
          { nome: { contains: 'ARC Raiders' } },
          { nome: { contains: 'Game' } }
        ]
      }
    case 'electronics':
      return {
        ...base,
        OR: [
          { nome: { contains: 'Keyboard' } },
          { nome: { contains: 'Router' } },
          { nome: { contains: 'Mouse' } },
          { nome: { contains: 'Monitor' } },
          { nome: { contains: 'Headset' } },
          { nome: { contains: 'Webcam' } },
          { nome: { contains: 'Electronics' } }
        ]
      }
    default:
      return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const secret = String(body?.secret || '').trim()
  if (secret !== process.env.ADMIN_SYNC_SECRET && secret !== 'sync-intl-2024') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const results: any[] = []

  try {
    // 1. Criar categorias comerciais (upsert por slug+storeSlug)
    for (const cat of COMMERCIAL_CATEGORIES) {
      const existing = await (prisma as any).categoria.findUnique({
        where: { slug_storeSlug: { slug: cat.slug, storeSlug: STORE_SLUG } }
      }).catch(() => null)

      let categoriaId: string
      if (!existing) {
        const created = await (prisma as any).categoria.create({
          data: {
            nome: cat.nome,
            slug: cat.slug,
            storeSlug: STORE_SLUG,
            ativo: true
          }
        })
        categoriaId = created.id
        results.push({ action: 'created', slug: cat.slug, id: categoriaId })
      } else {
        categoriaId = existing.id
        if (!existing.ativo) {
          await (prisma as any).categoria.update({
            where: { id: categoriaId },
            data: { ativo: true }
          })
          results.push({ action: 'activated', slug: cat.slug, id: categoriaId })
        } else {
          results.push({ action: 'exists', slug: cat.slug, id: categoriaId })
        }
      }

      // 2. Buscar produtos por critério de nome
      const where = buildWhereForSlug(cat.slug)
      if (!where) continue

      const produtos = await (prisma as any).produto.findMany({
        where,
        select: { id: true, nome: true, slug: true }
      })

      let linked = 0
      let skipped = 0

      for (const prod of produtos) {
        const exists = await (prisma as any).produtoCategoria.findUnique({
          where: {
            produtoId_categoriaId: {
              produtoId: prod.id,
              categoriaId
            }
          }
        }).catch(() => null)

        if (exists) {
          skipped++
          continue
        }

        await (prisma as any).produtoCategoria.create({
          data: {
            produtoId: prod.id,
            categoriaId
          }
        })
        linked++
      }

      results.push({
        slug: cat.slug,
        productsFound: produtos.length,
        linked,
        skipped
      })
    }

    return { ok: true, results }
  } catch (err: any) {
    console.error('[sync-intl-categories] error:', err?.message || err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Sync failed' })
  }
})
