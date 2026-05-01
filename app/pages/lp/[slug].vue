<script setup lang="ts">
import type { SeoPageData } from '~/components/seo/SeoLandingTemplate.vue'

definePageMeta({ layout: 'default', ssr: false })

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
  server: false,
  lazy: true,
  default: () => null
})

const page = computed<SeoPageData | null>(() => (data.value?.page as SeoPageData) || null)
const isPreview = computed(() => Boolean(previewToken.value))
const isFallback = computed(() => Boolean(error.value) || !page.value)
const isNoindex = computed(() => isFallback.value || Boolean(page.value?.noindex) || String(page.value?.status || '') !== 'published' || isPreview.value)

const canonicalBase = locale === 'en' ? 'https://casadosoftware.store' : 'https://casadosoftware.com.br'
const canonicalUrl = computed(() => `${canonicalBase}/lp/${slug.value}`)

useSeoMeta({
  title: computed(() => page.value?.seoTitle || page.value?.title || 'Oferta especial Casa do Software'),
  description: computed(() => page.value?.seoDescription || 'Compra segura com entrega digital imediata.'),
  ogTitle: computed(() => page.value?.seoTitle || page.value?.title || 'Oferta especial Casa do Software'),
  ogDescription: computed(() => page.value?.seoDescription || 'Compra segura com entrega digital imediata.'),
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

    <SeoLandingTemplate v-if="page" :page="page" />

    <section v-else class="mx-auto max-w-3xl px-5 py-12">
      <div class="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center">
        <h1 class="text-2xl font-black text-gray-900">Oferta principal disponível</h1>
        <p class="mt-3 text-sm text-gray-600">Sistema em modo seguro. Você pode concluir sua compra normalmente.</p>
        <ul class="mt-5 space-y-2 text-sm text-gray-700">
          <li>Entrega digital imediata</li>
          <li>Compra segura</li>
          <li>Suporte por WhatsApp</li>
        </ul>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink to="/checkout" class="inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
            Comprar agora
          </NuxtLink>
          <a href="https://wa.me/5511910512647" target="_blank" rel="noopener" class="inline-flex rounded-xl border border-green-600 px-5 py-3 text-sm font-bold text-green-700 hover:bg-green-100 transition">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
