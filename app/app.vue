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
</script>
