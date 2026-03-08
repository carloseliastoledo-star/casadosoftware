<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-5xl mx-auto px-6">
      <h1 class="text-3xl font-bold text-gray-900">{{ t('blog.title') }}</h1>
      <p class="text-sm text-gray-600 mt-2">{{ t('blog.subtitle') }}</p>

      <div v-if="pending" class="mt-8 text-sm text-gray-600">{{ t('blog.loading') }}</div>
      <div v-else-if="error" class="mt-8 text-sm text-red-600">{{ t('blog.errorLoading') }}</div>

      <div v-else class="mt-8">
        <div v-if="!posts.length" class="text-sm text-gray-600">{{ t('blog.empty') }}</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="p in posts"
            :key="p.slug"
            class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition"
          >
            <NuxtLink :to="`${langPrefix}/blog/${p.slug}`" class="block">
              <div class="bg-gray-100">
                <img
                  :src="p.featuredImage || '/images/blog-default.svg'"
                  :alt="p.titulo"
                  class="w-full h-44 object-cover"
                  loading="lazy"
                />
              </div>

              <div class="p-6">
                <div class="text-lg font-bold text-gray-900 leading-snug">
                  {{ p.titulo }}
                </div>
                <div v-if="p.descricao" class="text-sm text-gray-600 mt-3 line-clamp-3">
                  {{ p.descricao }}
                </div>
                <div class="text-xs text-gray-500 mt-4">{{ t('blog.updatedAt') }} {{ formatDate(p.atualizadoEm) }}</div>

                <div class="mt-5">
                  <span class="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 hover:bg-blue-700 transition">
                    {{ t('blog.readMore') }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { siteName } = useSiteBranding()

const { t, locale } = useI18n()

const route = useRoute()
const langPrefix = computed(() => {
  const p = String(route.path || '')
  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const first = p.split('/').filter(Boolean)[0] || ''
  if (first && langs.includes(first)) return `/${first}`
  return ''
})

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const host = computed(() => {
  if (process.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch {
      // ignore
    }
    const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
    const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
    const first = String(raw).split(',')[0]?.trim()
    return String(first || '').toLowerCase()
  }
  return String(window.location.host || '').toLowerCase()
})

const normalizedHost = computed(() => {
  const h0 = String(host.value || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
})

const isCasaDoSoftware = computed(() => {
  if (normalizedHost.value.includes('casadosoftware.com.br')) return true
  return storeSlug.value === 'casadosoftware'
})

useSeoMeta(() => {
  if (isCasaDoSoftware.value) {
    const title = 'Tutoriais de Ativação Windows e Office | Casa do Software'
    const description =
      'Aprenda a ativar Windows e Office legalmente com nossos guias passo a passo. Dicas, comparativos e suporte técnico.'

    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description
    }
  }

  const title = `Blog - ${siteName}`
  return { title }
})

type BlogPostListDto = {
  titulo: string
  slug: string
  featuredImage: string | null
  descricao: string
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; posts: BlogPostListDto[] }>('/api/blog', {
  server: true
})

const posts = computed(() => data.value?.posts || [])

function formatDate(input: string) {
  try {
    const map: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      it: 'it-IT',
      de: 'de-DE'
    }
    const loc = map[String(locale.value || 'pt')] || 'pt-BR'
    return new Date(input).toLocaleDateString(loc)
  } catch {
    return input
  }
}
</script>
