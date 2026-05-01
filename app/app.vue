<template>
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

</template>

<script setup lang="ts">
const route = useRoute()
const { companyLegalName, siteName, logoPath } = useSiteBranding()
const siteUrl = useSiteUrl()

type SiteSettingsResponse = { settings?: { headHtml?: string; bodyOpenHtml?: string; bodyCloseHtml?: string } }


const isPublicSite = computed(() => !String(route.path || '').startsWith('/admin'))

const NOINDEX_PATHS = ['/checkout', '/obrigado', '/sucesso', '/upsell', '/admin']
const isNoindex = computed(() => NOINDEX_PATHS.some((p) => String(route.path || '').startsWith(p)))

useHead(() => {
  if (isNoindex.value) {
    return { meta: [{ name: 'robots', content: 'noindex, nofollow' }] }
  }

  const origin = String(siteUrl || '').replace(/\/$/, '') || 'https://casadosoftware.com.br'
  const orgName = companyLegalName || siteName || 'Casa do Software'
  const logo = logoPath ? `${origin}${String(logoPath).startsWith('/') ? '' : '/'}${logoPath}` : undefined

  return {
    script: [{
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
  }
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
