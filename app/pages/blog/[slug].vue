<template>
  <section class="bg-gray-50 min-h-screen py-10 md:py-14">
    <div class="max-w-6xl mx-auto px-6">
      <div v-if="pending" class="text-sm text-gray-600">{{ t('blog.loading') }}</div>
      <div v-else-if="error" class="text-sm text-red-600">{{ t('blog.notFound') }}</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <article class="lg:col-span-8 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-10">
            <nav class="text-xs text-gray-500 mb-5">
              <NuxtLink :to="`${langPrefix}/`" class="hover:text-blue-700 transition">Home</NuxtLink>
              <span class="mx-2">/</span>
              <NuxtLink :to="`${langPrefix}/blog`" class="hover:text-blue-700 transition">Blog</NuxtLink>
              <span v-if="post?.titulo" class="mx-2">/</span>
              <span v-if="post?.titulo" class="text-gray-700 font-medium">{{ post?.titulo }}</span>
            </nav>

            <header class="max-w-3xl">
              <p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Blog</p>
              <h1 class="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                {{ post?.titulo }}
              </h1>
              <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span v-if="post?.atualizadoEm">{{ t('blog.updatedAt') }} {{ formatDate(post.atualizadoEm) }}</span>
                <span v-if="readingMinutes">{{ readingMinutes }} min</span>
              </div>
            </header>

            <img
              :src="post?.featuredImage || '/images/blog-default.svg'"
              :alt="post?.titulo || 'Imagem do post'"
              class="blog-featured-image"
              loading="lazy"
            />

            <div class="mt-8">
              <div ref="articleEl" class="blog-article blog-content" v-html="safePostHtml" />
            </div>

            <div v-if="relatedPosts.length" class="mt-10 border-t pt-8">
              <div class="flex items-center justify-between gap-4">
                <h2 class="text-lg md:text-xl font-bold text-gray-900">Conteúdos relacionados</h2>
                <NuxtLink :to="`${langPrefix}/blog`" class="text-sm text-blue-700 font-semibold hover:text-blue-800 transition">Ver todos</NuxtLink>
              </div>

              <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <article
                  v-for="p in relatedPosts"
                  :key="p.slug"
                  class="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition bg-white"
                >
                  <NuxtLink :to="`${langPrefix}/blog/${p.slug}`" class="block">
                    <div class="bg-gray-100">
                      <img
                        :src="p.featuredImage || '/images/blog-default.svg'"
                        :alt="p.titulo"
                        class="w-full h-36 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div class="p-5">
                      <div class="text-base font-extrabold text-gray-900 leading-snug line-clamp-2">{{ p.titulo }}</div>
                      <div v-if="p.descricao" class="text-sm text-gray-600 mt-2 line-clamp-2">{{ p.descricao }}</div>
                      <div v-if="p.atualizadoEm" class="text-xs text-gray-500 mt-3">{{ formatDate(String(p.atualizadoEm)) }}</div>
                    </div>
                  </NuxtLink>
                </article>
              </div>
            </div>

            <IntlLanguageSwitcher
              page-type="blog-post"
              :slug="String(slug)"
              class="mt-8"
            />

            <div class="mt-10 border-t pt-8">
              <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 class="text-lg md:text-xl font-bold">{{ t('blog.ctaTitle') }}</h2>
                    <p class="text-white/90 text-sm mt-1">{{ t('blog.ctaBody') }}</p>
                  </div>
                  <NuxtLink
                    :to="`${langPrefix}/produtos`"
                    class="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-5 py-3 hover:bg-blue-50 transition"
                  >
                    {{ t('blog.ctaButton') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </article>

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

          <div v-if="toc.length" class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="text-sm font-semibold text-gray-900">Sumário</div>
            <nav class="mt-3">
              <a
                v-for="item in toc"
                :key="item.id"
                :href="`#${item.id}`"
                class="blog-toc-link"
                :class="item.level === 3 ? 'pl-4' : ''"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>

          <div v-if="recentPosts.length" class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="text-sm font-semibold text-gray-900">Posts recentes</div>
            <div class="mt-3 space-y-3">
              <NuxtLink v-for="p in recentPosts" :key="p.slug" :to="`${langPrefix}/blog/${p.slug}`" class="block group">
                <div class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition line-clamp-2">
                  {{ p.titulo }}
                </div>
                <div v-if="p.atualizadoEm" class="text-xs text-gray-500 mt-1">{{ formatDate(String(p.atualizadoEm)) }}</div>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { sanitizeRichHtml } from '../../utils/sanitizeRichHtml'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const langPrefix = computed(() => {
  const p = String(route.path || '')
  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const first = p.split('/').filter(Boolean)[0] || ''
  if (first && langs.includes(first)) return `/${first}`
  return ''
})

const siteUrl = useSiteUrl()

const canonicalForHead = computed(() => {
  const origin = String(siteUrl || '').replace(/\/$/, '')
  if (!origin) return String(canonicalUrl.value || '')
  try {
    const path = String(route.fullPath || '/').split('#')[0]
    return `${origin}${path}`
  } catch {
    return String(canonicalUrl.value || '')
  }
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

const canonicalUrl = computed(() => {
  try {
    if (process.server) {
      const url = useRequestURL()
      if (url?.href) return String(url.href)
      const headers = useRequestHeaders(['x-forwarded-proto', 'x-forwarded-host', 'host']) as Record<string, string | undefined>
      const proto = String(headers?.['x-forwarded-proto'] || 'https')
      const host = String(headers?.['x-forwarded-host'] || headers?.host || '')
        .split(',')[0]
        ?.trim()
      if (host) return `${proto}://${host}${String(route.fullPath || '')}`
      return ''
    }
    return String(window.location.href || '')
  } catch {
    return ''
  }
})

type BlogPostDto = {
  titulo: string
  slug: string
  featuredImage: string | null
  excerpt?: string | null
  keyword?: string | null
  html: string | null
  criadoEm?: string
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; post: BlogPostDto }>(() => `/api/blog/${slug.value}`, {
  server: true,
  key: () => `blog-post-${slug.value}`,
  watch: [slug]
})

const post = computed(() => data.value?.post || null)

const postHtml = computed(() => String(post.value?.html || ''))

type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

const articleEl = ref<HTMLElement | null>(null)
const toc = ref<TocItem[]>([])

const safePostHtml = computed(() => {
  let raw = postHtml.value
  if (!raw) return ''
  raw = raw.replace(/<\/?template\b[^>]*>/gi, '')
  return sanitizeRichHtml(raw, { allowIframes: true })
})

const readingMinutes = computed(() => {
  const txt = String(postHtml.value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!txt) return 0
  const words = txt.split(' ').filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return minutes
})

function slugify(input: string): string {
  const s = String(input || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'secao'
}

function buildToc() {
  if (!process.client) return
  const root = articleEl.value
  if (!root) return

  const items: TocItem[] = []
  const used = new Set<string>()

  const headings = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[]
  for (const h of headings) {
    const level = h.tagName === 'H3' ? 3 : 2
    const text = String(h.textContent || '').trim()
    if (!text) continue

    let id = h.getAttribute('id') || ''
    if (!id) id = slugify(text)
    while (used.has(id)) id = `${id}-2`
    used.add(id)
    h.setAttribute('id', id)

    items.push({ id, text, level: level as 2 | 3 })
  }

  toc.value = items
}

onMounted(() => {
  buildToc()
})

watch(
  () => safePostHtml.value,
  () => {
    setTimeout(() => buildToc(), 0)
  }
)

type BlogPostListDto = {
  titulo: string
  slug: string
  featuredImage: string | null
  descricao: string
  keyword?: string | null
  criadoEm: string
  atualizadoEm: string
}

const { data: recentData } = await useFetch<{ ok: true; posts: BlogPostListDto[] }>('/api/blog', {
  server: true
})

const recentPosts = computed(() => {
  const all = recentData.value?.posts || []
  const current = String(post.value?.slug || '')
  return all.filter((p) => String(p?.slug || '') && String(p.slug) !== current).slice(0, 5)
})

function normalizeTokens(input: unknown): string[] {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3)
    .slice(0, 12)
}

const relatedPosts = computed(() => {
  const all = recentData.value?.posts || []
  const currentSlug = String(post.value?.slug || '')
  const kw = String((post.value as any)?.keyword || '').trim()
  const baseTokens = kw ? normalizeTokens(kw) : normalizeTokens(post.value?.titulo)
  if (!baseTokens.length) return []

  const scored = all
    .filter((p) => String(p?.slug || '') && String(p.slug) !== currentSlug)
    .map((p) => {
      const candidate = String((p as any)?.keyword || '') || String(p?.titulo || '')
      const tokens = normalizeTokens(candidate)
      const score = tokens.reduce((acc, t) => (baseTokens.includes(t) ? acc + 1 : acc), 0)
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p)

  return scored
})

const { siteName, logoPath, companyLegalName } = useSiteBranding()

useHead(() => {
  const title = post.value?.titulo ? `${post.value.titulo} - ${siteName}` : siteName
  const description = String((post.value as any)?.excerpt || '') || undefined

  const url = String(canonicalForHead.value || '')
  const origin = String(siteUrl || '').replace(/\/$/, '')
  const logoAbsolute = origin && logoPath ? `${origin}${String(logoPath).startsWith('/') ? '' : '/'}${logoPath}` : undefined

  const jsonLd: any[] = []
  if (url) {
    const image = post.value?.featuredImage || undefined
    const published = (post.value as any)?.criadoEm || undefined
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.value?.titulo || undefined,
      description,
      image: image ? [image] : undefined,
      datePublished: published,
      dateModified: post.value?.atualizadoEm || undefined,
      author: {
        '@type': 'Organization',
        name: companyLegalName || siteName
      },
      publisher: {
        '@type': 'Organization',
        name: companyLegalName || siteName,
        logo: logoAbsolute
          ? {
              '@type': 'ImageObject',
              url: logoAbsolute
            }
          : undefined
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url
    })

    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: url.replace(/\/blog\/.*/, '/')
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: url.replace(/\/blog\/.*/, '/blog')
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.value?.titulo || 'Post',
          item: url
        }
      ]
    })
  }

  return {
    title,
    meta: description ? [{ name: 'description', content: description }] : [],
    link: [
      ...(url ? [{ rel: 'canonical', href: url }] : []),
      ...((hreflangLinks.value as any[]) || [])
    ],
    script: jsonLd.length
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)
          }
        ]
      : []
  }
})

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

<style>
.blog-content :where(img) {
  border-radius: 0.75rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.blog-content :where(a) {
  text-decoration: underline;
  font-weight: 600;
}

.blog-content :where(a):hover {
  opacity: 0.9;
}

.blog-content :where(div.bg-blue-50) {
  border-radius: 0.75rem;
}
</style>
