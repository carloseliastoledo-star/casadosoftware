<script setup lang="ts">
type CategoriaDto = { id: string; nome: string; slug: string }

const intl = useIntlContext()

const { siteName } = useSiteBranding()

const { data, pending, error } = await useApi<{ ok: true; categorias: CategoriaDto[] }>('/api/categorias')

const categorias = computed(() => data.value?.categorias || [])

const ui = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'Categories',
      subtitle: 'Browse by category',
      loading: 'Loading...',
      error: 'Unable to load categories.'
    }
  }
  return {
    title: 'Categorias',
    subtitle: 'Navegue por categoria',
    loading: 'Carregando...',
    error: 'Não foi possível carregar as categorias.'
  }
})

const categoryPathPrefix = computed(() => (intl.language.value === 'en' ? '/category' : '/categoria'))

useSeoMeta({
  title: `${ui.value.title} | ${siteName}`
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">{{ ui.title }}</h1>
      <p class="text-sm text-gray-600 mt-1">{{ ui.subtitle }}</p>
    </div>

    <div v-if="pending" class="text-gray-500">{{ ui.loading }}</div>
    <div v-else-if="error" class="text-red-600">{{ ui.error }}</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="c in categorias"
        :key="c.id"
        :to="`${categoryPathPrefix}/${c.slug}`"
        class="bg-white rounded-lg border hover:shadow-sm transition p-4"
      >
        <div class="font-semibold">{{ c.nome }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ categoryPathPrefix }}/{{ c.slug }}/</div>
      </NuxtLink>
    </div>
  </div>
</template>
