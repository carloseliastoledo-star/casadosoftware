<template>
  <Head>
    <template v-if="isPublicSite && headHtml">
      <div v-html="headHtml" />
    </template>
  </Head>

  <template v-if="isPublicSite && bodyOpenHtml">
    <div v-html="bodyOpenHtml" />
  </template>

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

const { data: siteSettings } = await useFetch('/api/site-settings')

const isPublicSite = computed(() => !String(route.path || '').startsWith('/admin'))

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
