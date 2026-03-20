<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-gray-900">Admin</h1>
          <p class="mt-2 text-sm text-gray-600">Choose a product to upload or replace its image.</p>
        </div>
        <NuxtLink to="/" class="text-sm font-extrabold text-brand-blue hover:underline">← Back to store</NuxtLink>
      </div>

      <div class="mt-6">
        <div class="text-sm font-extrabold text-gray-900">Products</div>

        <div v-if="pending" class="mt-3 text-sm text-gray-600">Loading…</div>
        <div v-else-if="error" class="mt-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">
          Could not load catalog.
        </div>

        <div v-else class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="p in products"
            :key="p.slug"
            :to="`/admin/products/${p.slug}`"
            class="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:border-gray-200 hover:bg-white"
          >
            <div class="text-base font-extrabold text-gray-900">{{ p.title }}</div>
            <div class="mt-1 text-xs text-gray-600">Slug: <span class="font-mono">{{ p.slug }}</span></div>
            <div class="mt-3 text-sm font-extrabold text-brand-blue">Upload image →</div>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-600">
        Optional security: set <span class="font-mono">ADMIN_TOKEN</span> in your env. When set, /api/admin/* requires a Bearer token.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/catalog'

type CatalogResponse = {
  categories: any[]
  products: Product[]
}

const { data, pending, error } = await useFetch<CatalogResponse>('/api/catalog')
const products = computed(() => data.value?.products || [])

useSeoMeta(() => ({
  title: 'Admin',
  description: 'Admin dashboard.'
}))
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.text-brand-blue { color: #1D4ED8; }
</style>
