export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return

  const config = useRuntimeConfig()

  const { data: siteSettings } = await useFetch('/api/site-settings', { server: false })
  const settings = (siteSettings.value as any)?.settings || {}

  const gaId = String(settings.googleAnalyticsId || (config.public as any).gaId || config.public.googleAnalyticsId || '').trim()
  const adsId = String(settings.googleAdsConversionId || config.public.googleAdsConversionId || '').trim()

  const primaryId = gaId || adsId
  if (!primaryId) return

  const w = window as any

  if (!w.dataLayer) w.dataLayer = []
  if (!w.gtag) {
    w.gtag = function gtag() { w.dataLayer.push(arguments) }
  }

  if (!document.querySelector(`script[src^="https://www.googletagmanager.com/gtag/js?id="]`)) {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`
    script.async = true
    document.head.appendChild(script)
  }

  const isDebug = window.location.search.includes('debug_ga=1')

  w.gtag('js', new Date())

  if (gaId) {
    w.gtag('config', gaId, {
      send_page_view: false,
      ...(isDebug ? { debug_mode: true } : {})
    })
  }

  if (adsId) {
    w.gtag('config', adsId)
  }

  const router = useRouter()

  const pagePath = () => window.location.pathname + window.location.search + window.location.hash

  const trackPageView = () => {
    if (!gaId) return
    w.gtag('config', gaId, {
      page_path: pagePath(),
      ...(isDebug ? { debug_mode: true } : {})
    })
  }

  trackPageView()

  router.afterEach(() => {
    trackPageView()
  })
})
