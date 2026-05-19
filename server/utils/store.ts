export type StoreContext = {
  storeSlug: string | null
  includeLegacy: boolean
}

import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

function normalizeSlug(input: string) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeHost(input: string) {
  const raw = String(input || '').trim().toLowerCase()
  const first = raw.split(',')[0]?.trim() || ''
  const noProto = first.replace(/^https?:\/\//, '')
  const noPath = noProto.replace(/\/.*/, '')
  const noPort = noPath.replace(/:\d+$/, '')
  return noPort.replace(/^www\./, '')
}

function mapHostToStoreSlug(host: string) {
  const h = normalizeHost(host)
  if (!h) return ''
  if (h.includes('localhost') || h.includes('127.0.0.1')) return ''
  if (h.includes('casadosoftware.com.br')) return ''
  if (h.includes('licencasdigitais.com.br')) return 'licencasdigitais'
  if (h.includes('gvgmall.co')) return 'international'
  return normalizeSlug(h)
}

export function getStoreContext(event?: H3Event): StoreContext {
  const storeSlugEnv = normalizeSlug(process.env.STORE_SLUG || '')
  const includeLegacy = String(process.env.STORE_INCLUDE_LEGACY || '').trim() === 'true'

  const DEFAULT_STORES = ['casadosoftware']
  if (storeSlugEnv && !DEFAULT_STORES.includes(storeSlugEnv)) {
    return { storeSlug: storeSlugEnv, includeLegacy }
  }
  if (storeSlugEnv && DEFAULT_STORES.includes(storeSlugEnv)) {
    return { storeSlug: null, includeLegacy }
  }

  const siteUrl = String(process.env.SITE_URL || '').trim()
  if (siteUrl) {
    const mappedFromUrl = mapHostToStoreSlug(siteUrl)
    if (mappedFromUrl) return { storeSlug: mappedFromUrl, includeLegacy }
    return { storeSlug: null, includeLegacy }
  }

  if (event) {
    const host =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'x-original-host') ||
      getRequestHeader(event, 'host') ||
      ''
    const inferred = mapHostToStoreSlug(host)
    if (inferred) return { storeSlug: inferred, includeLegacy }
  }

  return { storeSlug: null, includeLegacy }
}

export function whereForStore<T extends Record<string, any>>(
  baseWhere: T,
  ctx: StoreContext
): T | { OR: any[] } {
  if (!ctx.storeSlug) {
    return baseWhere
  }

  if (ctx.includeLegacy) {
    return {
      OR: [{ ...baseWhere, storeSlug: ctx.storeSlug }, { ...baseWhere, storeSlug: null }]
    }
  }

  return { ...baseWhere, storeSlug: ctx.storeSlug }
}
