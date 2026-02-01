<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-5xl mx-auto px-6">
      <h1 class="text-3xl font-bold text-gray-900">Blog</h1>
      <p class="text-sm text-gray-600 mt-2">Novidades e tutoriais.</p>

      <div v-if="pending" class="mt-8 text-sm text-gray-600">Carregando...</div>
      <div v-else-if="error" class="mt-8 text-sm text-red-600">Não foi possível carregar o blog.</div>

      <div v-else class="mt-8 space-y-4">
        <div v-if="!posts.length" class="text-sm text-gray-600">Nenhum post publicado ainda.</div>

        <NuxtLink
          v-for="p in posts"
          :key="p.slug"
          :to="`/${p.slug}`"
          class="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition"
        >
          <div class="text-xl font-bold text-gray-900">{{ p.titulo }}</div>
          <div class="text-xs text-gray-500 mt-2">Atualizado em {{ formatDate(p.atualizadoEm) }}</div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteName } = useSiteBranding()

useHead(() => ({ title: `Blog - ${siteName}` }))

type BlogPostListDto = {
  titulo: string
  slug: string
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; posts: BlogPostListDto[] }>('/api/blog', {
  server: true
})

const posts = computed(() => data.value?.posts || [])

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString('pt-BR')
  } catch {
    return input
  }
}
</script>
