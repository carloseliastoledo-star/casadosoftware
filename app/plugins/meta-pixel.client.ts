/**
 * Meta Pixel (Facebook Pixel) — inicializa fbq via META_PIXEL_ID
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  setTimeout(() => {
    const config = useRuntimeConfig()
    const pixelId = String((config.public as any).metaPixelId || '').trim()
    if (!pixelId) return

    const w = window as any
    if (w.fbq) return // já inicializado

    w._fbq = w.fbq = function () {
      if (w.fbq.callMethod) w.fbq.callMethod.apply(w.fbq, arguments as any)
      else (w.fbq.queue = w.fbq.queue || []).push(arguments)
    }
    w.fbq.push = w.fbq
    w.fbq.loaded = true
    w.fbq.version = '2.0'
    w.fbq.queue = []

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    w.fbq('init', pixelId)
    w.fbq('track', 'PageView')

    const router = useRouter()
    router.afterEach(() => { w.fbq?.('track', 'PageView') })
  }, 2000)
})
