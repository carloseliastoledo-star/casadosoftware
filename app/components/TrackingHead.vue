<script setup lang="ts">
const { data: trackingSettings } = await useFetch('/api/public/settings/tracking', {
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

const ga4Id = computed(() => {
  const id = String(trackingSettings.value?.ga4Id || '').trim()
  return id || null
})

const googleAdsConversionId = computed(() => {
  const id = String(trackingSettings.value?.googleAdsConversionId || '').trim()
  return id || null
})

const googleAdsLabel = computed(() => {
  const label = String(trackingSettings.value?.googleAdsLabel || '').trim()
  return label || null
})

const metaPixelId = computed(() => {
  const id = String(trackingSettings.value?.metaPixelId || '').trim()
  return id || null
})

const tiktokPixelId = computed(() => {
  const id = String(trackingSettings.value?.tiktokPixelId || '').trim()
  return id || null
})

const headHtml = computed(() => {
  const html = String(trackingSettings.value?.headHtml || '').trim()
  return html || null
})

const bodyStartHtml = computed(() => {
  const html = String(trackingSettings.value?.bodyStartHtml || '').trim()
  return html || null
})

const primaryGtagId = computed(() => ga4Id.value || googleAdsConversionId.value)

const shouldLoadGtag = computed(() => !!primaryGtagId.value)

const shouldLoadMeta = computed(() => !!metaPixelId.value)

const shouldLoadTikTok = computed(() => !!tiktokPixelId.value)

useHead(() => {
  const scripts: any[] = []
  const noscripts: any[] = []

  // Carregar gtag.js se necessário
  if (shouldLoadGtag.value && primaryGtagId.value) {
    scripts.push({
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtagId.value)}`,
      async: true
    })
  }

  // Carregar Meta Pixel se necessário
  if (shouldLoadMeta.value && metaPixelId.value) {
    scripts.push({
      innerHTML: `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${metaPixelId.value}');
        fbq('track', 'PageView');
      `,
      type: 'text/javascript'
    })
    noscripts.push({
      innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId.value}&ev=PageView&noscript=1" />`
    })
  }

  // Carregar TikTok Pixel se necessário
  if (shouldLoadTikTok.value && tiktokPixelId.value) {
    scripts.push({
      innerHTML: `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${tiktokPixelId.value}');
          ttq.page();
        }(window, document, 'ttq');
      `,
      type: 'text/javascript'
    })
  }

  return {
    script: scripts,
    noscript: noscripts
  }
})

// Inicializar gtag no client
onMounted(() => {
  if (!import.meta.client) return

  const w = window as any

  if (shouldLoadGtag.value && primaryGtagId.value) {
    // Inicializar dataLayer e gtag se não existirem
    if (!w.dataLayer) w.dataLayer = []
    if (!w.gtag) {
      w.gtag = function gtag() { w.dataLayer.push(arguments) }
    }

    // Configurar GA4 se existir
    if (ga4Id.value) {
      w.gtag('config', ga4Id.value, {
        send_page_view: false
      })
    }

    // Configurar Google Ads se existir
    if (googleAdsConversionId.value) {
      w.gtag('config', googleAdsConversionId.value)
    }
  }
})
</script>

<template>
  <!-- Injeta headHtml se existir -->
  <div v-if="headHtml" v-html="headHtml" class="tracking-head-html" />
  
  <!-- Injeta bodyStartHtml se existir -->
  <div v-if="bodyStartHtml" v-html="bodyStartHtml" class="tracking-body-start-html" />
</template>
