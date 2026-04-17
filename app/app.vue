<template>
  <Head>
    <template v-if="isPublicSite && headHtml">
      <div v-html="headHtml" />
    </template>
  </Head>

  <template v-if="isPublicSite && bodyOpenHtml">
    <div v-html="bodyOpenHtml" />
  </template>

  <TrackingHead v-if="isPublicSite" />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <template v-if="isPublicSite && bodyCloseHtml">
    <div v-html="bodyCloseHtml" />
  </template>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const { companyLegalName, siteName, logoPath } = useSiteBranding()
const siteUrl = useSiteUrl()

const { data: siteSettings } = await useFetch('/api/site-settings', { default: () => null })
const { data: trackingSettings } = await useFetch('/api/public/settings/tracking', { default: () => ({ ga4Id: null }) })

const isPublicSite = computed(() => !String(route.path || '').startsWith('/admin'))

const NOINDEX_PATHS = ['/checkout', '/obrigado', '/sucesso', '/upsell', '/admin']
const isNoindex = computed(() => NOINDEX_PATHS.some((p) => String(route.path || '').startsWith(p)))

const ga4Id = computed(() => String(trackingSettings.value?.ga4Id || '').trim() || null)

useHead(() => {
  if (isNoindex.value) {
    return { meta: [{ name: 'robots', content: 'noindex, nofollow' }] }
  }

  const origin = String(siteUrl || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
  const orgName = companyLegalName || siteName || 'Casa do Software'
  const logo = logoPath ? `${origin}${String(logoPath).startsWith('/') ? '' : '/'}${logoPath}` : undefined

  const scripts: any[] = [{
    type: 'application/ld+json',
    key: 'org-jsonld',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: origin,
      logo: logo ? { '@type': 'ImageObject', url: logo } : undefined,
      sameAs: [origin]
    })
  }]

  // Injetar gtag.js e configuração inline
  if (isPublicSite.value && ga4Id.value) {
    scripts.push({
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id.value)}`,
      key: 'gtag-js'
    })
    scripts.push({
      id: 'gtag-inline',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${ga4Id.value}', {
          send_page_view: true,
          debug_mode: true
        });
      `,
      tagPosition: 'head'
    })
  }

  return {
    script: scripts,
    __dangerouslyDisableSanitizersByTagID: {
      'gtag-inline': ['innerHTML']
    }
  }
})

const headHtml = computed(() => String((siteSettings.value as any)?.settings?.headHtml || ''))
const bodyOpenHtml = computed(() => String((siteSettings.value as any)?.settings?.bodyOpenHtml || ''))
const bodyCloseHtml = computed(() => String((siteSettings.value as any)?.settings?.bodyCloseHtml || ''))

const googleAnalyticsId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAnalyticsId
  return String(fromDb || config.public.googleAnalyticsId || '')
})

const googleAdsConversionId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAdsConversionId
  return String(fromDb || config.public.googleAdsConversionId || '')
})

// Watch para disparar page views quando a rota muda
onMounted(() => {
  watch(
    () => route.fullPath,
    () => {
      if (import.meta.client && isPublicSite.value && ga4Id.value && typeof (window as any).gtag === 'function') {
        console.log('[app.vue] Disparando page view para:', route.fullPath)
        ;(window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_location: window.location.href,
          page_title: document.title,
          debug_mode: true
        })
      }
    },
    { immediate: true }
  )
})
</script>
