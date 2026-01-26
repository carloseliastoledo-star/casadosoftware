<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">

      <h1 class="text-3xl font-bold text-gray-900 mb-10 text-center">
        Nossos Produtos
      </h1>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        Carregando produtos...
      </div>

      <!-- Erro -->
      <div v-else-if="error" class="text-center py-20 text-red-600">
        Erro ao carregar produtos.
      </div>

      <!-- Grid -->
      <div
        v-else
        :key="products.length"
        class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
      >
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

definePageMeta({ ssr: true })

useHead(() => ({
  link: [{ rel: 'canonical', href: 'https://casadosoftware.com.br/produtos' }]
}))

const { data, pending, error } = await useFetch('/api/products', {
  server: true
})

const products = computed(() => data.value || [])
</script>
