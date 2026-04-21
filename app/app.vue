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

  <!-- Botão WhatsApp Flutuante -->
  <a
    v-if="isPublicSite"
    href="https://wa.me/5511910512647"
    target="_blank"
    aria-label="WhatsApp"
    class="fixed bottom-10 right-10 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-110"
  >
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  </a>

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
