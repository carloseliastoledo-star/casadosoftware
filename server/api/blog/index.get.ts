import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma.js'
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities.js'

function firstImageFromHtml(html: unknown): string | null {
  const raw = String(html ?? '')
  if (!raw) return null

  const match = raw.match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  const src = (match?.[1] || match?.[2] || match?.[3] || '').trim()
  if (!src) return null
  return src
}

function stripHtml(input: unknown): string {
  const raw = String(input ?? '')
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerptFromHtml(html: unknown, maxLen = 160): string {
  const decoded = decodeHtmlEntities(html)
  const txt = stripHtml(decoded)
  if (!txt) return ''
  if (txt.length <= maxLen) return txt
  return `${txt.slice(0, maxLen).trimEnd()}…`
}

export default defineEventHandler(async () => {
  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'desc' },
      select: {
        titulo: true,
        slug: true,
        featuredImage: true,
        html: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })

    const normalized = Array.isArray(posts)
      ? posts.map((p: any) => ({
          titulo: p?.titulo,
          slug: p?.slug,
          featuredImage: p?.featuredImage || firstImageFromHtml(decodeHtmlEntities(p?.html)) || null,
          descricao: excerptFromHtml(p?.html),
          criadoEm: p?.criadoEm,
          atualizadoEm: p?.atualizadoEm
        }))
      : []

    return { ok: true, posts: normalized }
  } catch (err: any) {
    const message = String(err?.message || '')
    const code = String(err?.code || '')

    if (code === 'P2021' || message.includes('does not exist') || message.includes("doesn't exist")) {
      return { ok: true, posts: [] }
    }

    throw err
  }
})
