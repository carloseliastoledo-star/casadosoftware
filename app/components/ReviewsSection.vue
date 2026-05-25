<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  productId?: string
  limit?: number
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 6,
  compact: false
})

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
}>('/api/reviews', {
  query: {
    productId: props.productId || undefined
  }
})

const reviews = computed(() => data.value?.reviews?.slice(0, props.limit) || [])
const stats = computed(() => data.value?.stats || { total: 0, average: 0 })
</script>

<template>
  <div v-if="!pending" class="reviews-section">
    <!-- Versão compacta para checkout -->
    <div v-if="compact" class="flex items-center gap-2 text-sm flex-wrap">
      <span class="text-yellow-500 tracking-tight">★★★★★</span>
      <span class="font-semibold text-gray-900">4,9 de nota</span>
      <span class="text-gray-400">•</span>
      <span class="text-gray-600">Mais de 20 mil clientes atendidos</span>
    </div>

    <!-- Versão completa para Home, produto e página de avaliações -->
    <div v-else>
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">O que nossos clientes dizem</h2>
        <div class="flex items-center justify-center gap-2">
          <RatingStars :rating="stats.average" size="lg" :show-value="true" />
          <span class="text-gray-600">({{ stats.total }} avaliações)</span>
        </div>
      </div>

      <div v-if="reviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      <GoogleReviewsCard />
    </div>
  </div>

  <div v-else-if="pending" class="text-center py-8 text-gray-500">
    Carregando avaliações...
  </div>
</template>
