/**
 * store-slug plugin — runs synchronously before any component setup.
 *
 * Uses useState('effective_store_slug') as the SSR-safe propagation mechanism,
 * identical to how i18n.ts uses useState('ld_server_lang').
 *
 * Priority:
 *  1. STORE_SLUG env var (via runtimeConfig.public.storeSlug)
 *  2. Request hostname pattern matching
 */

export function resolveStoreSlugFromHost(host: string): string {
  const h = String(host || '').toLowerCase()
  if (!h) return ''
  if (h.includes('casadosoftware.com.br')) return 'casadosoftware'
  if (h.includes('licencasdigitais.com.br')) return 'licencasdigitais'
  if (h.includes('globalsoftware.store')) return 'international'
  if (h.includes('gvgmall.co')) return 'international'
  if (h.includes('globalsoftware-prev') && h.includes('vercel.app')) return 'international'
  return ''
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const fromEnv = String((config.public as any)?.storeSlug || '').trim().toLowerCase()

  let resolved = fromEnv

  if (!resolved) {
    let host = ''
    if (import.meta.server) {
      try {
        const event = useRequestEvent()
        const fwd = String(event?.node?.req?.headers?.['x-forwarded-host'] || '').trim()
        const h = String(event?.node?.req?.headers?.host || '').trim()
        host = (fwd || h).split(',')[0]?.trim()?.toLowerCase() || ''
      } catch { /* ignore */ }
    } else {
      try { host = String(window.location.host || '').toLowerCase() } catch { /* ignore */ }
    }
    resolved = resolveStoreSlugFromHost(host)
  }

  // useState propagates SSR value to client via hydration payload
  const storeSlugState = useState<string>('effective_store_slug', () => resolved)
  if (import.meta.server && resolved) storeSlugState.value = resolved
})
