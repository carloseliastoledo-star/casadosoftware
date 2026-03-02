<script setup lang="ts">
type CategoriaDto = { id: string; nome: string; slug: string }

const { siteName } = useSiteBranding()

const { t } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/categorias', {
  server: true
})

const categorias = computed(() => data.value?.categorias || [])

useSeoMeta({
  title: `${t('categories_title')} | ${siteName}`
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">{{ t('categories_title') }}</h1>
      <p class="text-sm text-gray-600 mt-1">{{ t('categories_subtitle') }}</p>
    </div>

    <div v-if="pending" class="text-gray-500">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-red-600">{{ t('categories_load_error') }}</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="c in categorias"
        :key="c.id"
        :to="localePath(`/categoria/${c.slug}`)"
        class="bg-white rounded-lg border hover:shadow-sm transition p-4"
      >
        <div class="font-semibold">{{ c.nome }}</div>
        <div class="text-xs text-gray-500 mt-1">/categoria/{{ c.slug }}/</div>
      </NuxtLink>
    </div>
  </div>
</template>
