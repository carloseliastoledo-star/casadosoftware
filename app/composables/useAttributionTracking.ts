/**
 * useAttributionTracking — First/Last Touch attribution tracking SSR-safe
 * Persiste first touch e last touch no localStorage.
 * Envia dados completos junto com a criação do pedido para salvar no banco.
 */

export type TrackingPayload = {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  content?: string | null
  term?: string | null
  gclid?: string | null
  fbclid?: string | null
  referrer?: string | null
  landing_page?: string | null
  page?: string | null
  user_agent?: string | null
  device?: string | null
}

const FIRST_KEY = 'cs_first_touch'
const LAST_KEY = 'cs_last_touch'

function getDevice(): string | null {
  if (!import.meta.client) return null
  const ua = navigator.userAgent || ''
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getExternalReferrer(): string | null {
  if (!import.meta.client) return null
  const ref = document.referrer || null
  if (!ref) return null
  try {
    const refHost = new URL(ref).hostname
    const currentHost = window.location.hostname
    if (refHost === currentHost) return null
    return ref
  } catch {
    return ref
  }
}

function inferSource(params: URLSearchParams): string | null {
  const utmSource = params.get('utm_source')
  if (utmSource) return utmSource
  if (params.get('gclid')) return 'google'
  if (params.get('fbclid')) return 'facebook'
  return null
}

function inferMedium(params: URLSearchParams): string | null {
  const utmMedium = params.get('utm_medium')
  if (utmMedium) return utmMedium
  if (params.get('gclid')) return 'cpc'
  if (params.get('fbclid')) return 'paid_social'
  return null
}

export function useAttributionTracking() {

  function buildPayload(): TrackingPayload | null {
    if (!import.meta.client) return null

    const params = new URLSearchParams(window.location.search)
    const referrer = getExternalReferrer()
    const hasTracking =
      params.get('utm_source') ||
      params.get('utm_medium') ||
      params.get('utm_campaign') ||
      params.get('utm_content') ||
      params.get('utm_term') ||
      params.get('gclid') ||
      params.get('fbclid') ||
      referrer

    if (!hasTracking) return null

    return {
      source: inferSource(params),
      medium: inferMedium(params),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term'),
      gclid: params.get('gclid'),
      fbclid: params.get('fbclid'),
      referrer,
      landing_page: window.location.href,
      page: window.location.href,
      user_agent: navigator.userAgent,
      device: getDevice()
    }
  }

  function captureAttribution() {
    if (!import.meta.client) return

    const payload = buildPayload()
    if (!payload) return

    try {
      const first = localStorage.getItem(FIRST_KEY)
      if (!first) {
        localStorage.setItem(FIRST_KEY, JSON.stringify(payload))
        console.log('[ATTRIBUTION] first touch saved', payload)
      }

      localStorage.setItem(LAST_KEY, JSON.stringify(payload))
      console.log('[ATTRIBUTION] last touch updated', payload)
    } catch {
      // localStorage indisponível
    }
  }

  function capturePageView(path?: string) {
    if (!import.meta.client) return

    // Sempre capturar atribuição (UTMs, gclid, referrer)
    captureAttribution()

    // Disparar page_view no GA4
    const currentPath = path || window.location.pathname + window.location.search
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: currentPath,
        page_location: window.location.href,
        page_title: document.title
      })
    }
    console.log('[GA4] page_view', currentPath)
  }

  function getAttributionForOrder() {
    if (!import.meta.client) return null

    try {
      const firstRaw = localStorage.getItem(FIRST_KEY)
      const lastRaw = localStorage.getItem(LAST_KEY)

      return {
        first_touch: firstRaw ? JSON.parse(firstRaw) : null,
        last_touch: lastRaw ? JSON.parse(lastRaw) : null,
        checkout_page: window.location.href,
        user_agent: navigator.userAgent,
        device: getDevice()
      }
    } catch {
      return null
    }
  }

  // Alias mantido para compatibilidade com useEcommerceTracking
  function getPurchaseAttributionPayload() {
    const data = getAttributionForOrder()
    if (!data) {
      return {
        first_landing_page: '(unknown)', last_landing_page: '(unknown)',
        last_page_before_checkout: '(unknown)', referrer: '(direct)',
        utm_source: '(none)', utm_medium: '(none)', utm_campaign: '(none)',
        utm_content: '(none)', utm_term: '(none)',
        gclid: '', fbclid: '', msclkid: '', gateway: undefined
      }
    }
    const first = data.first_touch || {} as TrackingPayload
    const last = data.last_touch || {} as TrackingPayload
    return {
      first_landing_page: first.landing_page || '(unknown)',
      last_landing_page: last.landing_page || '(unknown)',
      last_page_before_checkout: data.checkout_page || '(unknown)',
      referrer: (first.referrer || last.referrer || '(direct)'),
      utm_source: (last.source || first.source || '(none)'),
      utm_medium: (last.medium || first.medium || '(none)'),
      utm_campaign: (last.campaign || first.campaign || '(none)'),
      utm_content: (last.content || first.content || '(none)'),
      utm_term: (last.term || first.term || '(none)'),
      gclid: (last.gclid || first.gclid || ''),
      fbclid: (last.fbclid || first.fbclid || ''),
      msclkid: '',
      gateway: undefined
    }
  }

  return {
    captureAttribution,
    capturePageView,
    getAttributionForOrder,
    getPurchaseAttributionPayload,
    // Aliases de compatibilidade
    captureEntry: captureAttribution,
    captureBeforeCheckout: (_gateway?: string) => { /* noop — dados já capturados em getAttributionForOrder */ },
    getAttribution: () => {
      if (!import.meta.client) return {}
      try {
        const last = localStorage.getItem(LAST_KEY)
        return last ? JSON.parse(last) : {}
      } catch { return {} }
    }
  }
}
