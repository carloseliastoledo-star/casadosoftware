<template>
  <div class="bg-gray-50 min-h-screen">
    <section class="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-14 mb-10">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h1 class="text-4xl font-extrabold">Blog Casa do Software</h1>
        <p class="mt-3 text-blue-100 text-lg">Guias, tutoriais e novidades sobre Windows, Office e licenças digitais.</p>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 mb-12">
      <h2 class="text-2xl font-bold mb-6">🔥 Artigos populares</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <h3 class="font-bold">Windows OEM vs Retail</h3>
          <p class="text-sm text-gray-600 mt-2">Entenda as diferenças entre as licenças Windows e qual escolher.</p>
        </div>
        <div class="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <h3 class="font-bold">Como ativar Windows 11</h3>
          <p class="text-sm text-gray-600 mt-2">Aprenda a ativar o Windows 11 passo a passo.</p>
        </div>
        <div class="bg-white border rounded-xl p-5 hover:shadow-md transition">
          <h3 class="font-bold">Office 365 vale a pena?</h3>
          <p class="text-sm text-gray-600 mt-2">Descubra se o Office 365 compensa em 2026.</p>
        </div>
      </div>
    </section>

    <section class="py-10 md:py-14">
      <div class="max-w-6xl mx-auto px-6">
        <div v-if="pending" class="text-sm text-gray-600">{{ t('blog.loading') }}</div>
        <div v-else-if="error" class="text-sm text-red-600">{{ t('blog.errorLoading') }}</div>

        <div v-else>
          <div v-if="!posts.length" class="text-sm text-gray-600">{{ t('blog.empty') }}</div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article
              v-for="post in posts"
              :key="post.slug"
              class="bg-white border border-gray-100 rounded-2xl overflow-hidden transition duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <NuxtLink :to="`${langPrefix}/blog/${post.slug}`" class="block">
                <div class="bg-gray-100">
                  <img
                    :src="post.featuredImage || '/images/blog-default.svg'"
                    :alt="post.titulo"
                    class="w-full h-52 object-cover"
                    loading="lazy"
                  />
                </div>

                <div class="p-6">
                  <span class="text-xs font-semibold text-blue-600">{{ post.categoria || 'Tutorial' }}</span>

                  <h2 class="text-lg font-bold text-gray-900 mt-2 leading-snug">
                    {{ post.titulo }}
                  </h2>

                  <p class="text-sm text-gray-600 mt-3 line-clamp-3">
                    {{ post.descricao }}
                  </p>

                  <div class="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <span>{{ formatDate(post.atualizadoEm) }}</span>
                    <span>5 min leitura</span>
                  </div>

                  <div class="mt-5">
                    <span
                      class="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 hover:bg-blue-700 transition"
                    >
                      Ler artigo →
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
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
  const fullPath = typeof route.fullPath === 'string' ? route.fullPath : '/'
  const noQuery = fullPath.split('?')[0] ?? '/'
  const rawPath = (noQuery.split('#')[0] ?? '/') || '/'
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

const seoMeta = computed(() => ({
  title: isCasaDoSoftware.value ? 'Blog Casa do Software' : `Blog - ${siteName}`,
  description: isCasaDoSoftware.value ? 'Tutoriais, guias e novidades sobre Windows, Office e licenças digitais.' : '',
  ogTitle: isCasaDoSoftware.value ? 'Blog Casa do Software' : `Blog - ${siteName}`,
  ogDescription: isCasaDoSoftware.value ? 'Tutoriais, guias e novidades sobre Windows, Office e licenças digitais.' : '',
  twitterTitle: isCasaDoSoftware.value ? 'Blog Casa do Software' : `Blog - ${siteName}`,
  twitterDescription: isCasaDoSoftware.value ? 'Tutoriais, guias e novidades sobre Windows, Office e licenças digitais.' : ''
}))

useSeoMeta(() => seoMeta.value)

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
  categoria?: string | null
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
