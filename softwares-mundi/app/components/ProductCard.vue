<template>
  <div class="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
    <ProductMockup :variant="product.imageVariant" :image-url="product.imageUrl" />

    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-extrabold tracking-tight text-gray-900">
          <NuxtLink :to="`/product/${product.slug}`" class="hover:text-brand-blue">
            {{ product.title }}
          </NuxtLink>
        </h3>
        <p class="mt-2 text-sm text-gray-600">{{ product.shortDescription }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-700">
          <span class="text-amber-500">★★★★★</span>
          <span>{{ ratingLabel }}</span>
          <span class="text-gray-400">•</span>
          <span>Trusted by 50,000+ customers worldwide</span>
        </div>
      </div>

      <div v-if="discountPercent" class="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
        {{ discountPercent }}% OFF
      </div>
    </div>

    <div class="mt-5 flex items-end justify-between gap-4">
      <div>
        <div class="text-lg font-extrabold text-gray-900">{{ price }}</div>
        <div v-if="compareAt" class="text-xs font-semibold text-gray-400 line-through">{{ compareAt }}</div>
      </div>

      <NuxtLink
        :to="`/product/${product.slug}`"
        class="inline-flex items-center justify-center rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
      >
        Get License
      </NuxtLink>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-extrabold text-amber-800">
      <span>Limited time offer 🔥</span>
      <span v-if="stockLeftLabel">{{ stockLeftLabel }}</span>
    </div>

    <div class="mt-4 grid gap-2 text-xs text-gray-600">
      <div class="flex items-center gap-2">
        <span class="inline-flex h-2 w-2 rounded-full bg-brand-green" />
        <span>Instant Email Delivery</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex h-2 w-2 rounded-full bg-brand-green" />
        <span>Genuine License</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/catalog'
import { formatUsd } from '~/data/catalog'
import ProductMockup from '~/components/ProductMockup.vue'

const props = defineProps<{ product: Product }>()

const price = computed(() => formatUsd(props.product.priceUsdCents))
const compareAt = computed(() => (props.product.compareAtUsdCents ? formatUsd(props.product.compareAtUsdCents) : ''))
const stockLeftLabel = computed(() => {
  const left = Number(props.product.stockLeft ?? 0)
  if (!left || left < 0) return ''
  return `Only ${left} licenses left`
})

const ratingLabel = computed(() => {
  const rating = Number(props.product.rating ?? 4.8)
  const reviews = Number(props.product.reviewCount ?? 12483)
  return `${rating.toFixed(1)}/5 (${reviews.toLocaleString('en-US')} reviews)`
})
const discountPercent = computed(() => {
  if (!props.product.compareAtUsdCents) return 0
  const p = props.product.priceUsdCents
  const c = props.product.compareAtUsdCents
  if (c <= 0 || p >= c) return 0
  return Math.round(((c - p) / c) * 100)
})
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.bg-brand-green { background-color: #16A34A; }
</style>
