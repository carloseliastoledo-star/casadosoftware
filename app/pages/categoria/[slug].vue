<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">{{ categoria?.nome || 'Categoria' }}</h1>
      <p class="text-sm text-gray-600 mt-1" v-if="categoria?.slug">/categoria/{{ categoria.slug }}/</p>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Categoria não encontrada.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="p in produtos"
        :key="p.id"
        :to="`/produto/${p.slug}`"
        class="bg-white rounded-lg shadow hover:shadow-md transition p-4"
      >
        <div v-if="p.image" class="w-full h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
          <img :src="p.image" class="w-full h-full object-contain" />
        </div>
        <div class="mt-3 font-semibold">{{ p.name }}</div>
        <div class="mt-1 text-sm text-gray-600" v-if="p.price !== null && p.price !== undefined">
          {{ formatMoney(p.price) }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug || '')

const { data, pending, error } = await useFetch(() => `/api/categorias/${slug}`, {
  server: true
})

const categoria = computed(() => (data.value as any)?.categoria || null)
const produtos = computed(() => (data.value as any)?.produtos || [])

const canonicalUrl = computed(() => {
  const s = categoria.value?.slug || slug
  if (!s) return ''
  const url = useRequestURL()
  const origin = url?.origin || ''
  return origin ? `${origin}/categoria/${s}` : ''
})

const pageTitle = computed(() => {
  return categoria.value?.nome ? `${categoria.value.nome} | Casa do Software` : 'Categoria | Casa do Software'
})

const pageDescription = computed(() => {
  return categoria.value?.descricao || ''
})

useSeoMeta({
  title: pageTitle,
  description: pageDescription
})

useHead(() => ({
  link: canonicalUrl.value
    ? [{ rel: 'canonical', href: canonicalUrl.value }]
    : []
}))

function formatMoney(n: number) {
  try {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  } catch {
    return String(n)
  }
}
</script>
