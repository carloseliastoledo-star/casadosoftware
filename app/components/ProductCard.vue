<script setup lang="ts">
import { computed } from 'vue'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  old_price?: number | null
  image?: string | null
}

const props = defineProps<{
  product: Product
}>()

const productImage = computed(() => {
  const image = (props.product as any)?.image ?? (props.product as any)?.imagem

  if (!image) {
    return '/products/placeholder.png'
  }

  if (image.startsWith('http')) {
    return image
  }

  if (image.startsWith('/')) {
    return image
  }

  const cleanImage = image
    .replace(/^\/+/, '')
    .replace(/^products\//, '')
    .replace(/^public\//, '')

  return `/${cleanImage}`
})

const formattedPrice = computed(() => {
  return props.product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const formattedOldPrice = computed(() => {
  if (!props.product.old_price) return null

  return props.product.old_price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

function buyNow(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  navigateTo({ path: '/checkout', query: { product: props.product.slug } })
}
</script>

<template>
  <NuxtLink
    :to="`/produto/${product.slug}`"
    class="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col"
  >
    <!-- Badge -->
    <span
      class="self-start mb-3 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700"
    >
      ENVIO IMEDIATO
    </span>

    <!-- Imagem -->
    <div class="h-40 flex items-center justify-center mb-4">
      <img
        :src="productImage"
        :alt="product.name"
        class="max-h-full object-contain"
        loading="lazy"
      />
    </div>

    <!-- Nome -->
    <h3 class="font-semibold text-gray-900 mb-1">
      {{ product.name }}
    </h3>

    <!-- Preços -->
    <div class="mt-auto">
      <div
        v-if="formattedOldPrice"
        class="text-sm text-gray-400 line-through"
      >
        {{ formattedOldPrice }}
      </div>

      <div class="text-xl font-bold text-blue-600">
        {{ formattedPrice }}
      </div>

      <button
        @click="buyNow"
        class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
      >
        Comprar agora
      </button>
    </div>
  </NuxtLink>
</template>
