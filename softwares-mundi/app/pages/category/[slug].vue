<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ category?.name || 'Category' }}</h1>
          <p class="mt-2 text-sm text-gray-600">{{ category?.description }}</p>
        </div>
        <NuxtLink to="/" class="text-sm font-extrabold text-brand-blue hover:underline">← Back to Home</NuxtLink>
      </div>
    </div>

    <div v-if="!category" class="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
      Category not found.
    </div>

    <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="p in categoryProducts" :key="p.slug" :product="p" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import { useCatalog } from '~/composables/useCatalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())

const catalog = useCatalog()

const category = computed(() => catalog.getCategory(slug.value))
const categoryProducts = computed(() => (category.value ? catalog.getProductsByCategory(category.value.slug) : []))

useSeoMeta(() => ({
  title: category.value?.name ? `${category.value.name} Licenses` : 'Category',
  description: category.value?.description || 'Browse software licenses by category.'
}))
</script>

<style scoped>
.text-brand-blue { color: #1D4ED8; }
</style>
