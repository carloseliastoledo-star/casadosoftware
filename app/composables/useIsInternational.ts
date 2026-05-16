/**
 * useIsInternational — single source of truth for international store detection.
 *
 * Detection priority:
 *  1. STORE_SLUG env var === 'international'  (most reliable: set in Vercel project settings)
 *  2. Hostname === globalsoftware.store or subdomain thereof
 *
 * Intentionally does NOT depend on intl.language.value, which is unreliable on
 * *.vercel.app preview URLs (useIntlContext explicitly excludes .vercel.app from isEnDomain).
 */
export function useIsInternational(): Ref<boolean> {
  const config = useRuntimeConfig()

  const storeSlug = computed(() =>
    String((config.public as any)?.storeSlug || '').trim().toLowerCase()
  )

  const host = computed<string>(() => {
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
  })

  return computed<boolean>(() => {
    if (storeSlug.value === 'international') return true
    const h = host.value
    return h.includes('globalsoftware.store') || h.includes('globalsoftware-preview')
  })
}
