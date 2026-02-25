import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError } from 'h3'

function extractFileNameFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const pathname = u.pathname || ''
    const parts = pathname.split('/').filter(Boolean)
    if (!parts.length) return null
    return parts[parts.length - 1] || null
  } catch {
    const trimmed = String(url || '').trim()
    if (!trimmed) return null
    const parts = trimmed.split('/').filter(Boolean)
    if (!parts.length) return null
    return parts[parts.length - 1] || null
  }
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body: any = await readBody(event)
  const dryRun = body?.dryRun !== false

  const spacesBaseUrl = String(body?.spacesBaseUrl || process.env.SPACES_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '')
  if (!spacesBaseUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spacesBaseUrl não informado e SPACES_PUBLIC_BASE_URL não configurado'
    })
  }

  const products = await (prisma as any).produto.findMany({
    select: { id: true, slug: true, imagem: true }
  })

  const changes: Array<{ id: string; slug: string; from: string; to: string }> = []

  for (const p of products) {
    const current = typeof p.imagem === 'string' ? p.imagem.trim() : ''
    if (!current) continue

    if (current.startsWith(spacesBaseUrl)) continue

    let isWpUploads = false
    try {
      const u = new URL(current)
      isWpUploads = u.pathname.includes('/wp-content/uploads/')
    } catch {
      isWpUploads = current.includes('/wp-content/uploads/')
    }

    if (!isWpUploads) continue

    const fileName = extractFileNameFromUrl(current)
    if (!fileName) continue

    const next = `${spacesBaseUrl}/uploads/${fileName}`

    if (next === current) continue

    changes.push({ id: p.id, slug: p.slug, from: current, to: next })
  }

  if (!changes.length) {
    return {
      ok: true,
      dryRun,
      spacesBaseUrl,
      matched: 0,
      updated: 0,
      changes: []
    }
  }

  if (!dryRun) {
    for (const ch of changes) {
      await (prisma as any).produto.update({
        where: { id: ch.id },
        data: { imagem: ch.to }
      })
    }
  }

  return {
    ok: true,
    dryRun,
    spacesBaseUrl,
    matched: changes.length,
    updated: dryRun ? 0 : changes.length,
    changes
  }
})
