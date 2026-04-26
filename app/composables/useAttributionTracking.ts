/**
 * useAttributionTracking - Attribution tracking SSR-safe
 * Salva dados de atribuição (UTMs, referrer, landing pages, gateway)
 * para eliminar (not set) no GA4 e enriquecer eventos de purchase.
 */

export type AttributionData = {
  first_landing_page?: string
  last_landing_page?: string
  last_page_before_checkout?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  fbclid?: string
  msclkid?: string
  gateway?: 'mercado_pago' | 'stripe'
  created_at?: string
  updated_at?: string
}

const ATTR_KEY = 'cs_attribution_data'

export function useAttributionTracking() {
  const isClient = () => import.meta.client && typeof window !== 'undefined'

  const getCurrentUrlData = () => {
    if (!isClient()) return {}

    const url = new URL(window.location.href)

    return {
      pathname: url.pathname,
      fullPath: url.pathname + url.search,
      searchParams: url.searchParams,
      referrer: document.referrer || ''
    }
  }

  const getAttribution = (): AttributionData => {
    if (!isClient()) return {}

    try {
      return JSON.parse(localStorage.getItem(ATTR_KEY) || '{}')
    } catch {
      return {}
    }
  }

  const saveAttribution = (data: AttributionData) => {
    if (!isClient()) return

    try {
      localStorage.setItem(ATTR_KEY, JSON.stringify({
        ...data,
        updated_at: new Date().toISOString()
      }))
    } catch {
      // localStorage indisponível
    }
  }

  const captureEntry = () => {
    if (!isClient()) return

    const current = getCurrentUrlData()
    const existing = getAttribution()
    const now = new Date().toISOString()

    const data: AttributionData = {
      ...existing,
      created_at: existing.created_at || now,
      first_landing_page: existing.first_landing_page || current.fullPath,
      last_landing_page: current.fullPath,
      referrer: existing.referrer || current.referrer || ''
    }

    const keys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'gclid',
      'fbclid',
      'msclkid'
    ]

    keys.forEach((key) => {
      const value = current.searchParams?.get(key)

      if (value) {
        ;(data as any)[key] = value
      }
    })

    saveAttribution(data)

    console.log('[ATTRIBUTION] captureEntry', data)
  }

  const capturePageView = (path?: string) => {
    if (!isClient()) return

    const existing = getAttribution()
    const currentPath = path || window.location.pathname + window.location.search

    saveAttribution({
      ...existing,
      last_landing_page: currentPath
    })

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: currentPath,
        page_location: window.location.href,
        page_title: document.title
      })
    }

    console.log('[GA4] page_view', currentPath)
  }

  const captureBeforeCheckout = (gateway: 'mercado_pago' | 'stripe') => {
    if (!isClient()) return

    const existing = getAttribution()

    saveAttribution({
      ...existing,
      last_page_before_checkout: window.location.pathname + window.location.search,
      gateway
    })

    console.log('[ATTRIBUTION] before_checkout', gateway)
  }

  const getPurchaseAttributionPayload = () => {
    const data = getAttribution()

    return {
      first_landing_page: data.first_landing_page || '(unknown)',
      last_landing_page: data.last_landing_page || '(unknown)',
      last_page_before_checkout: data.last_page_before_checkout || '(unknown)',
      referrer: data.referrer || '(direct)',
      utm_source: data.utm_source || '(none)',
      utm_medium: data.utm_medium || '(none)',
      utm_campaign: data.utm_campaign || '(none)',
      utm_content: data.utm_content || '(none)',
      utm_term: data.utm_term || '(none)',
      gclid: data.gclid || '',
      fbclid: data.fbclid || '',
      msclkid: data.msclkid || '',
      gateway: data.gateway || undefined
    }
  }

  return {
    captureEntry,
    capturePageView,
    captureBeforeCheckout,
    getAttribution,
    getPurchaseAttributionPayload
  }
}
