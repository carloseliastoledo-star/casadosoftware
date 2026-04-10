<script setup lang="ts">
import type { SeoPageData } from '~/components/seo/SeoLandingTemplate.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const reqEvent = import.meta.server ? useRequestEvent() : null
const rawHost = import.meta.server
  ? String(
      reqEvent?.node?.req?.headers?.['x-forwarded-host'] ||
      reqEvent?.node?.req?.headers?.host || ''
    ).split(',')[0]?.trim().toLowerCase() || ''
  : String(window?.location?.hostname || '').toLowerCase()

const locale = rawHost.endsWith('.store') || rawHost.startsWith('en.') ? 'en' : 'pt'

const previewToken = computed(() => String(route.query.preview || ''))

const { data, error } = await useFetch('/api/seo-pages/by-slug', {
  query: computed(() => ({
    slug: slug.value,
    locale,
    preview: previewToken.value || undefined
  })),
  key: `seo-page-${locale}-${slug.value}`,
  default: () => null
})

if (error.value || !data.value?.page) {
  throw createError({ statusCode: 404, statusMessage: 'Página não encontrada', fatal: true })
}

const page = computed<SeoPageData>(() => data.value!.page as SeoPageData)
const isPreview = computed(() => Boolean(previewToken.value))
const isNoindex = computed(() => page.value.noindex || page.value.status !== 'published' || isPreview.value)

const canonicalBase = locale === 'en' ? 'https://casadosoftware.store' : 'https://casadosoftware.com.br'
const canonicalUrl = computed(() => `${canonicalBase}/lp/${slug.value}`)

useSeoMeta({
  title: computed(() => page.value.seoTitle || page.value.title),
  description: computed(() => page.value.seoDescription || ''),
  ogTitle: computed(() => page.value.seoTitle || page.value.title),
  ogDescription: computed(() => page.value.seoDescription || ''),
  ogUrl: canonicalUrl,
  ogType: 'website',
  robots: computed(() =>
    isNoindex.value
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  )
})

useHead({
  link: computed(() => {
    const links: any[] = [{ rel: 'canonical', href: canonicalUrl.value }]
    if (!isNoindex.value) {
      links.push({ rel: 'alternate', hreflang: locale === 'en' ? 'en' : 'pt-BR', href: canonicalUrl.value })
      links.push({ rel: 'alternate', hreflang: 'x-default', href: `https://casadosoftware.com.br/lp/${slug.value}` })
    }
    return links
  })
})
</script>

<template>
  <div>
    <div
      v-if="isPreview"
      class="bg-yellow-100 border-b border-yellow-300 text-yellow-800 text-sm text-center py-2 px-4 font-medium"
    >
      ⚠️ Modo Preview — esta página não está publicada e não será indexada pelo Google.
    </div>

    <SeoLandingTemplate :page="page" />
  </div>
</template>
