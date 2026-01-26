<script setup lang="ts">
type CategoriaDto = { id: string; nome: string; slug: string }

const { data, pending, error } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/categorias', {
  server: true
})

const categorias = computed(() => data.value?.categorias || [])

useSeoMeta({
  title: 'Categorias | Casa do Software'
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Categorias</h1>
      <p class="text-sm text-gray-600 mt-1">Navegue por categoria</p>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar as categorias.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="c in categorias"
        :key="c.id"
        :to="`/categoria/${c.slug}`"
        class="bg-white rounded-lg border hover:shadow-sm transition p-4"
      >
        <div class="font-semibold">{{ c.nome }}</div>
        <div class="text-xs text-gray-500 mt-1">/categoria/{{ c.slug }}/</div>
      </NuxtLink>
    </div>
  </div>
</template>
