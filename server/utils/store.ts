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
  if (h.includes('casadosoftware.com.br')) return 'casadosoftware'
  if (h.includes('licencasdigitais.com.br')) return 'licencasdigitais'
  if (h.includes('gvgmall.co')) return 'international'
  return normalizeSlug(h)
}

export function getStoreContext(event?: H3Event): StoreContext {
  const storeSlugEnv = normalizeSlug(process.env.STORE_SLUG || '')
  const includeLegacyEnv = String(process.env.STORE_INCLUDE_LEGACY || '').trim() === 'true'

  // Habilitar includeLegacy para casadosoftware para incluir registros antigos com storeSlug null
  const includeLegacy = includeLegacyEnv || storeSlugEnv === 'casadosoftware'

  if (storeSlugEnv) {
    return { storeSlug: storeSlugEnv, includeLegacy }
  }

  const siteUrl = String(process.env.SITE_URL || '').trim()
  if (siteUrl) {
    const mappedFromUrl = mapHostToStoreSlug(siteUrl)
    if (mappedFromUrl) {
      // Habilitar includeLegacy para casadosoftware
      const mappedIncludeLegacy = mappedFromUrl === 'casadosoftware' ? true : includeLegacy
      return { storeSlug: mappedFromUrl, includeLegacy: mappedIncludeLegacy }
    }
  }

  if (event) {
    const host =
      getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'x-original-host') ||
      getRequestHeader(event, 'host') ||
      ''
    const inferred = mapHostToStoreSlug(host)
    if (inferred) {
      // Habilitar includeLegacy para casadosoftware
      const inferredIncludeLegacy = inferred === 'casadosoftware' ? true : includeLegacy
      return { storeSlug: inferred, includeLegacy: inferredIncludeLegacy }
    }
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
