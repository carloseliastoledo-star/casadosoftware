<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-8">
        <div v-if="pending" class="text-sm text-gray-600">Carregando...</div>
        <div v-else-if="error" class="text-sm text-red-600">Página não encontrada.</div>

        <div v-else>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">{{ post?.titulo }}</h1>
          <p v-if="post?.atualizadoEm" class="text-xs text-gray-500 mt-2">
            Atualizado em {{ formatDate(post.atualizadoEm) }}
          </p>

          <div class="prose prose-gray max-w-none mt-6" v-html="safePostHtml" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'
import { createError } from 'h3'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

type BlogPostDto = {
  titulo: string
  slug: string
  html: string | null
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; post: BlogPostDto }>(() => `/api/blog/${slug.value}`, {
  server: true
})

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })
}

const post = computed(() => data.value?.post || null)

const postHtml = computed(() => String(post.value?.html || ''))

const safePostHtml = computed(() => {
  const raw = postHtml.value
  if (!raw) return ''
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
})

const { siteName } = useSiteBranding()
const baseUrl = useSiteUrl()

const canonicalUrl = computed(() => {
  const s = String(slug.value || '').trim()
  if (!s) return baseUrl ? `${baseUrl}/` : ''
  return baseUrl ? `${baseUrl}/${s}` : ''
})

useHead(() => {
  const title = post.value?.titulo ? `${post.value.titulo} - ${siteName}` : siteName
  return {
    title,
    link: canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : []
  }
})

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString('pt-BR')
  } catch {
    return input
  }
}
</script>
