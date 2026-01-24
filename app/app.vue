<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data: siteSettings } = await useFetch('/api/site-settings')

const googleAnalyticsId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAnalyticsId
  return String(fromDb || config.public.googleAnalyticsId || '')
})

const googleAdsConversionId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAdsConversionId
  return String(fromDb || config.public.googleAdsConversionId || '')
})

useHead(() => {
  const gaId = googleAnalyticsId.value
  const adsId = googleAdsConversionId.value

  const primaryId = gaId || adsId
  if (!primaryId) return {}

  return {
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`,
        async: true
      }
    ]
  }
})
</script>
