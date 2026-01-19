<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">

      <h1 class="text-3xl font-bold text-gray-900 mb-10 text-center">
        Nossos Produtos
      </h1>

      <div v-if="pending" class="text-center py-20 text-gray-500">
        Carregando produtos...
      </div>

      <div v-else-if="error" class="text-center py-20 text-red-600">
        Erro ao carregar produtos.
      </div>

      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
  v-for="product in products"
  :key="product.id + product.imagem"
  :product="product"
/>

      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

definePageMeta({ ssr: false })

const { data, pending, error } = await useFetch('/api/products', {
  server: false
})

const products = computed(() => data.value || [])
</script>
