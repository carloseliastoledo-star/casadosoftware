export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  const { data: siteSettings } = await useFetch('/api/site-settings', { server: false })

  const settings = (siteSettings.value as any)?.settings || {}

  const googleAnalyticsId = String(settings.googleAnalyticsId || config.public.googleAnalyticsId || '')
  const googleAdsConversionId = String(settings.googleAdsConversionId || config.public.googleAdsConversionId || '')

  const primaryId = googleAnalyticsId || googleAdsConversionId
  if (!primaryId) return

  const w = window as any
  w.dataLayer = w.dataLayer || []
  w.gtag = w.gtag || function gtag() { w.dataLayer.push(arguments) }

  w.gtag('js', new Date())

  const isDebug = window.location.search.includes('debug_ga=1')

  if (googleAnalyticsId) {
    w.gtag('config', googleAnalyticsId, {
      send_page_view: false,
      ...(isDebug ? { debug_mode: true } : {})
    })
  }

  if (googleAdsConversionId) {
    w.gtag('config', googleAdsConversionId)
  }

  const pageView = (path: string) => {
    if (!googleAnalyticsId) return

    w.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      ...(isDebug ? { debug_mode: true } : {})
    })
  }

  pageView(window.location.pathname + window.location.search + window.location.hash)

  nuxtApp.hook('page:finish', () => {
    pageView(window.location.pathname + window.location.search + window.location.hash)
  })
})
