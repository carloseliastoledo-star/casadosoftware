<template>
  <ClientOnly>
    <TrackingHead v-if="isPublicSite" />
  </ClientOnly>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

</template>

<script setup lang="ts">
import { normalizeUrl } from '~/utils/normalizeUrl'

const route = useRoute()
const { companyLegalName, siteName, logoPath } = useSiteBranding()
const siteUrl = useSiteUrl()

type SiteSettingsResponse = { settings?: { headHtml?: string; bodyOpenHtml?: string; bodyCloseHtml?: string } }


const isPublicSite = computed(() => !String(route.path || '').startsWith('/admin'))

const NOINDEX_PATHS = ['/checkout', '/obrigado', '/sucesso', '/upsell', '/admin']
const isNoindex = computed(() => NOINDEX_PATHS.some((p) => String(route.path || '').startsWith(p)))

useHead({
  script: [
    {
      key: 'gtm-script',
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TRF7PNLP');`,
      tagPriority: 0
    }
  ],
  noscript: [
    {
      key: 'gtm-noscript',
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TRF7PNLP" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      tagPosition: 'bodyOpen'
    }
  ]
}, {
  tagPriority: 'critical',
  __dangerouslyDisableSanitizersByTagID: {
    'gtm-script': ['innerHTML'],
    'gtm-noscript': ['innerHTML']
  }
} as any)

useHead(() => {
  if (isNoindex.value) {
    return { meta: [{ name: 'robots', content: 'noindex, nofollow' }] }
  }

  const origin = String(siteUrl || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
  const orgName = companyLegalName || siteName || 'Casa do Software'
  const logo = logoPath ? normalizeUrl(logoPath, origin) : undefined

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

  return { script: scripts }
})

// Attribution tracking (first/last touch) + page_view em toda navegação SPA
const { captureAttribution, capturePageView } = useAttributionTracking()

function appendInlineHtml(html: string, target: HTMLElement) {
  if (!import.meta.client || !html) return
  const container = document.createElement('div')
  container.innerHTML = html
  target.appendChild(container)
}

onMounted(() => {
  if (!import.meta.client) return
  setTimeout(async () => {
    if (isPublicSite.value) {
      let settings: SiteSettingsResponse['settings'] = {}

      try {
        settings = ((await $fetch<SiteSettingsResponse>('/api/site-settings'))?.settings || {})
      } catch {
        settings = {}
      }

      appendInlineHtml(String(settings.headHtml || ''), document.head)
      appendInlineHtml(String(settings.bodyOpenHtml || ''), document.body)
      appendInlineHtml(String(settings.bodyCloseHtml || ''), document.body)
      captureAttribution()
    }

    watch(
      () => route.fullPath,
      (path) => {
        if (import.meta.client && isPublicSite.value) {
          capturePageView(path)
        }
      },
      { immediate: true }
    )
  }, 2000)
})
</script>
