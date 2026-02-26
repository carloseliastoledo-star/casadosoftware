import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError, defineEventHandler, readBody } from 'h3'

function extractKeysFromListBucketXml(xml: string): string[] {
  const keys: string[] = []
  const re = /<Key>([^<]+)<\/Key>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    const raw = m[1] || ''
    const key = raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
    if (key) keys.push(key)
  }
  return keys
}

function getTagValue(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([^<]*)<\\/${tag}>`)
  const m = xml.match(re)
  return m?.[1] ?? null
}

function safeSlug(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body: any = await readBody(event)
  const dryRun = body?.dryRun !== false

  const spacesBaseUrl = String(body?.spacesBaseUrl || process.env.SPACES_PUBLIC_BASE_URL || '')
    .trim()
    .replace(/\/+$/, '')

  if (!spacesBaseUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spacesBaseUrl não informado e SPACES_PUBLIC_BASE_URL não configurado'
    })
  }

  const listBaseUrl = String(body?.listBaseUrl || spacesBaseUrl).trim().replace(/\/+$/, '')
  const prefix = String(body?.prefix || 'uploads/').trim() || 'uploads/'
  const maxKeys = Math.min(1000, Math.max(1, Number(body?.maxKeys || 1000)))
  const maxPages = Math.min(50, Math.max(1, Number(body?.maxPages || 20)))
  const force = body?.force === true

  // 1) Fetch public bucket listing (XML)
  const allKeys: string[] = []
  let marker = ''

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(listBaseUrl)
    url.searchParams.set('prefix', prefix)
    url.searchParams.set('max-keys', String(maxKeys))
    if (marker) url.searchParams.set('marker', marker)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { accept: 'application/xml,text/xml,*/*' }
    })

    if (!res.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: `Falha ao buscar listagem pública do Spaces (http=${res.status})`
      })
    }

    const xml = await res.text()
    const keys = extractKeysFromListBucketXml(xml)
    allKeys.push(...keys)

    const isTruncated = (getTagValue(xml, 'IsTruncated') || '').trim().toLowerCase() === 'true'

    if (!isTruncated) break

    const nextMarker = (getTagValue(xml, 'NextMarker') || '').trim()
    marker = nextMarker || (keys.length ? keys[keys.length - 1] : '')

    if (!marker) break
  }

  // Build slug -> key map
  const keyBySlug = new Map<string, string>()
  const collisions: Record<string, string[]> = {}

  for (const key of allKeys) {
    if (!key.startsWith(prefix)) continue
    const file = key.split('/').pop() || ''
    const lower = file.toLowerCase()

    // heuristic: keys like "<timestamp>-<slug>.<ext>"
    const match = lower.match(/-([a-z0-9-]{2,})\.(png|jpe?g|webp|gif|svg)$/i)
    if (!match) continue

    const slug = safeSlug(match[1])
    if (!slug) continue

    if (!keyBySlug.has(slug)) {
      keyBySlug.set(slug, key)
    } else {
      const existing = keyBySlug.get(slug)!
      collisions[slug] = collisions[slug] || [existing]
      collisions[slug].push(key)
    }
  }

  // 2) Match products
  const products = await (prisma as any).produto.findMany({
    select: { id: true, slug: true, imagem: true }
  })

  const changes: Array<{ id: string; slug: string; from: string | null; to: string; key: string }> = []
  const missing: Array<{ id: string; slug: string; imagem: string | null }> = []

  for (const p of products) {
    const slug = safeSlug(p.slug)
    const key = slug ? keyBySlug.get(slug) : undefined

    const current = typeof p.imagem === 'string' ? p.imagem.trim() : ''
    const alreadyOk = current && current.startsWith(spacesBaseUrl)

    if (alreadyOk && !force) continue

    if (!key) {
      missing.push({ id: p.id, slug: p.slug, imagem: current || null })
      continue
    }

    const next = `${spacesBaseUrl}/${key.replace(/^\/+/, '')}`
    if (next === current && !force) continue

    changes.push({ id: p.id, slug: p.slug, from: current || null, to: next, key })
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
    listBaseUrl,
    prefix,
    keysFetched: allKeys.length,
    keysMatchedBySlug: keyBySlug.size,
    collisions,
    matched: changes.length,
    updated: dryRun ? 0 : changes.length,
    changes: changes.slice(0, 200),
    missing: missing.slice(0, 200),
    missingCount: missing.length
  }
})
