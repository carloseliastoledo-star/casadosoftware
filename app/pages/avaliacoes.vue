<script setup lang="ts">
import { computed } from 'vue'

const { data, pending } = await useFetch<{
  ok: true
  reviews: Array<{
    id: string
    customerName: string
    productName: string
    productId: string | null
    rating: number
    comment: string
    verified: boolean
    createdAt: string
  }>
  stats: {
    total: number
    average: number
  }
}>('/api/reviews')

const reviews = computed(() => data.value?.reviews || [])
const stats = computed(() => data.value?.stats || { total: 0, average: 0 })

useSeoMeta({
  title: 'Avaliações de Clientes - Casa do Software',
  description: 'Veja o que nossos clientes dizem sobre a Casa do Software. Avaliações reais de clientes que compraram licenças digitais Microsoft.'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Avaliações de Clientes da Casa do Software
        </h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Estas são avaliações reais de clientes que compraram licenças digitais na Casa do Software.
          Valorizamos a transparência e a honestidade em todas as nossas interações.
        </p>

        <!-- Estatísticas -->
        <div v-if="!pending && stats.total > 0" class="flex items-center justify-center gap-6">
          <div class="text-center">
            <div class="text-5xl font-bold text-gray-900">{{ stats.average }}</div>
            <div class="text-gray-600">Nota média</div>
          </div>
          <div class="h-16 w-px bg-gray-300"></div>
          <div class="text-center">
            <div class="text-5xl font-bold text-gray-900">{{ stats.total }}</div>
            <div class="text-gray-600">Avaliações publicadas</div>
          </div>
        </div>

        <div v-if="!pending && stats.total > 0" class="flex items-center justify-center gap-2 mt-4">
          <RatingStars :rating="stats.average" size="lg" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">Carregando avaliações...</p>
      </div>

      <!-- Lista de avaliações -->
      <div v-else-if="reviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :customer-name="review.customerName"
          :product-name="review.productName"
          :rating="review.rating"
          :comment="review.comment"
          :verified="review.verified"
          :created-at="review.createdAt"
        />
      </div>

      <!-- Sem avaliações -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 text-lg">Ainda não há avaliações publicadas.</p>
      </div>

      <!-- Card do Google -->
      <div class="max-w-2xl mx-auto">
        <GoogleReviewsCard />
      </div>
    </div>
  </div>
</template>
