/**
 * store-slug plugin — runs synchronously before any component setup.
 * Injects the correct storeSlug into runtimeConfig.public based on the
 * request hostname when STORE_SLUG env var is not set.
 *
 * This is needed for Vercel preview URLs (*.vercel.app) where the env var
 * is not configured but the hostname identifies the store.
 */

function detectHostFromRequest(): string {
  if (import.meta.server) {
    try {
      const event = useRequestEvent()
      const fwd = String(event?.node?.req?.headers?.['x-forwarded-host'] || '').trim()
      const h = String(event?.node?.req?.headers?.host || '').trim()
      const raw = (fwd || h).split(',')[0]?.trim() || ''
      return raw.toLowerCase()
    } catch {
      return ''
    }
  }
  try {
    return String(window.location.host || '').toLowerCase()
  } catch {
    return ''
  }
}

function resolveStoreSlugFromHost(host: string): string {
  if (!host) return ''
  if (host.includes('casadosoftware.com.br')) return 'casadosoftware'
  if (host.includes('licencasdigitais.com.br')) return 'licencasdigitais'
  if (host.includes('globalsoftware.store')) return 'international'
  if (host.includes('globalsoftware-prev') && host.includes('vercel.app')) return 'international'
  return ''
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const current = String((config.public as any)?.storeSlug || '').trim().toLowerCase()

  if (current) return

  const host = detectHostFromRequest()
  const resolved = resolveStoreSlugFromHost(host)

  if (resolved) {
    ;(config.public as any).storeSlug = resolved
  }
})
