<template>
  <section class="bg-gray-50 min-h-screen py-10 md:py-14">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{{ t('blog.title') }}</h1>
          <p class="text-sm text-gray-600 mt-2 max-w-2xl">{{ t('blog.subtitle') }}</p>
        </div>
        <NuxtLink
          :to="`${langPrefix}/produtos`"
          class="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-5 py-3 hover:bg-blue-700 transition"
        >
          {{ t('blog.ctaButton') }}
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-8 text-sm text-gray-600">{{ t('blog.loading') }}</div>
      <div v-else-if="error" class="mt-8 text-sm text-red-600">{{ t('blog.errorLoading') }}</div>

      <div v-else class="mt-8">
        <div v-if="!posts.length" class="text-sm text-gray-600">{{ t('blog.empty') }}</div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div class="lg:col-span-8 space-y-6">
            <article
              v-if="featured"
              class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition"
            >
              <NuxtLink :to="`${langPrefix}/blog/${featured.slug}`" class="block">
                <div class="bg-gray-100">
                  <img
                    :src="featured.featuredImage || '/images/blog-default.svg'"
                    :alt="featured.titulo"
                    class="w-full h-56 md:h-72 object-cover"
                    loading="lazy"
                  />
                </div>

                <div class="p-6 md:p-8">
                  <div class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Destaque</div>
                  <div class="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {{ featured.titulo }}
                  </div>
                  <div v-if="featured.descricao" class="text-sm text-gray-600 mt-3 line-clamp-3">
                    {{ featured.descricao }}
                  </div>
                  <div class="text-xs text-gray-500 mt-4">{{ t('blog.updatedAt') }} {{ formatDate(featured.atualizadoEm) }}</div>

                  <div class="mt-6">
                    <span class="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 hover:bg-blue-700 transition">
                      {{ t('blog.readMore') }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article
                v-for="p in rest"
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
                    <div class="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
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

          <aside class="lg:col-span-4 lg:sticky lg:top-6 space-y-5">
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
              <div class="text-sm font-semibold text-gray-900">{{ t('blog.ctaTitle') }}</div>
              <div class="text-xs text-gray-600 mt-1">{{ t('blog.ctaBody') }}</div>
              <NuxtLink
                :to="`${langPrefix}/produtos`"
                class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 py-2.5 hover:bg-blue-700 transition"
              >
                {{ t('blog.ctaButton') }}
              </NuxtLink>
            </div>

            <div v-if="posts.length" class="bg-white rounded-2xl border border-gray-100 p-5">
              <div class="text-sm font-semibold text-gray-900">Posts recentes</div>
              <div class="mt-3 space-y-3">
                <NuxtLink
                  v-for="p in posts.slice(0, 6)"
                  :key="p.slug"
                  :to="`${langPrefix}/blog/${p.slug}`"
                  class="block group"
                >
                  <div class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition line-clamp-2">
                    {{ p.titulo }}
                  </div>
                  <div v-if="p.atualizadoEm" class="text-xs text-gray-500 mt-1">{{ formatDate(p.atualizadoEm) }}</div>
                </NuxtLink>
              </div>
            </div>
          </aside>
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

const siteUrl = useSiteUrl()

const canonicalUrl = computed(() => {
  const origin = String(siteUrl || '').replace(/\/$/, '')
  if (!origin) return ''
  const path = String(route.fullPath || '/').split('#')[0]
  return `${origin}${path}`
})

const hreflangLinks = computed(() => {
  const origin = String(siteUrl || '').replace(/\/$/, '')
  if (!origin) return [] as any[]

  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const rawPath = String(route.fullPath || '/').split('?')[0].split('#')[0]
  const parts = rawPath.split('/').filter(Boolean)
  const first = parts[0] || ''
  const baseParts = first && langs.includes(first) ? parts.slice(1) : parts
  const basePath = '/' + baseParts.join('/')

  const links: any[] = []
  for (const l of langs) {
    const prefix = l === 'pt' ? '' : `/${l}`
    links.push({ rel: 'alternate', hreflang: l, href: `${origin}${prefix}${basePath}` })
  }
  links.push({ rel: 'alternate', hreflang: 'x-default', href: `${origin}${basePath}` })
  return links
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

useHead(() => {
  const links: any[] = []
  const canonical = String(canonicalUrl.value || '')
  if (canonical) links.push({ rel: 'canonical', href: canonical })
  links.push(...(hreflangLinks.value || []))
  return { link: links }
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

const featured = computed(() => posts.value[0] || null)
const rest = computed(() => posts.value.slice(1))

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
