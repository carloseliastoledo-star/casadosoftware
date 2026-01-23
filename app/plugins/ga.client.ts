export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  const { data: siteSettings } = await useFetch('/api/site-settings', { server: false })

  const googleAnalyticsId = String(
    (siteSettings.value as any)?.settings?.googleAnalyticsId || config.public.googleAnalyticsId || ''
  )

  if (!googleAnalyticsId) return

  const pageView = (path: string) => {
    const w = window as any
    if (typeof w.gtag !== 'function') return

    w.gtag('event', 'page_view', {
      send_to: googleAnalyticsId,
      page_path: path,
      page_location: window.location.href,
      page_title: document.title
    })
  }

  nuxtApp.hook('page:finish', () => {
    pageView(window.location.pathname + window.location.search + window.location.hash)
  })
})
