<script setup lang="ts">
const { data: trackingSettings } = await useFetch('/api/public/settings/tracking', {
  server: false,
  lazy: true,
  default: () => ({
    ga4Id: null,
    googleAdsConversionId: null,
    googleAdsLabel: null,
    metaPixelId: null,
    tiktokPixelId: null,
    headHtml: null,
    bodyStartHtml: null
  })
})

function appendScript(src: string) {
  if (!import.meta.client || !src) return
  if (document.querySelector(`script[src="${src}"]`)) return
  const script = document.createElement('script')
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function appendInlineHtml(html: string, target: HTMLElement) {
  if (!import.meta.client || !html) return
  const container = document.createElement('div')
  container.innerHTML = html
  target.appendChild(container)
}

function loadDelayedTracking() {
  const settings = trackingSettings.value as any
  const ga4Id = String(settings?.ga4Id || '').trim()
  const googleAdsConversionId = String(settings?.googleAdsConversionId || '').trim()
  const metaPixelId = String(settings?.metaPixelId || '').trim()
  const tiktokPixelId = String(settings?.tiktokPixelId || '').trim()
  const primaryGtagId = ga4Id || googleAdsConversionId
  const w = window as any

  if (primaryGtagId) {
    w.dataLayer = w.dataLayer || []
    w.gtag = w.gtag || function gtag() { w.dataLayer.push(arguments) }
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtagId)}`)
    w.gtag('js', new Date())
    if (ga4Id) w.gtag('config', ga4Id, { send_page_view: false })
    if (googleAdsConversionId) w.gtag('config', googleAdsConversionId)
  }

  if (metaPixelId && !w.fbq) {
    w._fbq = w.fbq = function () {
      if (w.fbq.callMethod) w.fbq.callMethod.apply(w.fbq, arguments as any)
      else (w.fbq.queue = w.fbq.queue || []).push(arguments)
    }
    w.fbq.push = w.fbq
    w.fbq.loaded = true
    w.fbq.version = '2.0'
    w.fbq.queue = []
    appendScript('https://connect.facebook.net/en_US/fbevents.js')
    w.fbq('init', metaPixelId)
    w.fbq('track', 'PageView')
  }

  if (tiktokPixelId && !w.ttq) {
    w.TiktokAnalyticsObject = 'ttq'
    const ttq = w.ttq = w.ttq || []
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']
    ttq.setAndDefer = function (t: any, e: string) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i])
    ttq.load = function (e: string) { appendScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(e)}&lib=ttq`) }
    ttq.load(tiktokPixelId)
    ttq.page()
  }

  appendInlineHtml(String(settings?.headHtml || '').trim(), document.head)
  appendInlineHtml(String(settings?.bodyStartHtml || '').trim(), document.body)
}

onMounted(() => {
  if (!import.meta.client) return
  setTimeout(() => {
    loadDelayedTracking()
  }, 2000)
})
</script>

<template>
  <span style="display: none" aria-hidden="true" />
</template>
