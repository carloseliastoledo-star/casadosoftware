<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-5xl mx-auto px-6">
      <div v-if="pending" class="text-sm text-gray-600">Carregando...</div>
      <div v-else-if="error" class="text-sm text-red-600">Post não encontrado.</div>

      <article v-else class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="p-6 md:p-10">
          <header class="max-w-3xl">
            <p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Blog</p>
            <h1 class="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {{ post?.titulo }}
            </h1>
            <p v-if="post?.atualizadoEm" class="text-sm text-gray-500 mt-3">
              Atualizado em {{ formatDate(post.atualizadoEm) }}
            </p>
          </header>

          <img
            :src="post?.featuredImage || '/images/blog-default.svg'"
            :alt="post?.titulo || 'Imagem do post'"
            class="blog-featured-image"
            loading="lazy"
          />

          <div class="mt-8">
            <div class="blog-article blog-content" v-html="safePostHtml" />
          </div>

          <div class="mt-10 border-t pt-8">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 class="text-lg md:text-xl font-bold">Quer comprar uma licença original com entrega automática?</h2>
                  <p class="text-white/90 text-sm mt-1">Veja nossos produtos e ative em minutos.</p>
                </div>
                <NuxtLink
                  to="/produtos"
                  class="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-5 py-3 hover:bg-blue-50 transition"
                >
                  Ver produtos
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sanitizeRichHtml } from '../../utils/sanitizeRichHtml'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

type BlogPostDto = {
  titulo: string
  slug: string
  featuredImage: string | null
  html: string | null
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; post: BlogPostDto }>(() => `/api/blog/${slug.value}`, {
  server: true
})

const post = computed(() => data.value?.post || null)

const postHtml = computed(() => String(post.value?.html || ''))

const safePostHtml = computed(() => {
  const raw = postHtml.value
  if (!raw) return ''
  return sanitizeRichHtml(raw, { allowIframes: true })
})

const { siteName } = useSiteBranding()

useHead(() => {
  const title = post.value?.titulo ? `${post.value.titulo} - ${siteName}` : siteName
  return { title }
})

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString('pt-BR')
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
