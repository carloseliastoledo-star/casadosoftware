<template>
  <NuxtLink
    :to="`/produto/${product.slug}`"
    class="block bg-white rounded-xl shadow hover:shadow-lg transition p-6"
  >
    <!-- Imagem do produto -->
    <img
      :src="imageSrc"
      :alt="product.nome"
      class="w-full h-40 object-contain mb-4"
    />

    <!-- Nome -->
    <h3 class="text-lg font-bold text-gray-900 mb-1">
      {{ product.nome }}
    </h3>

    <!-- Descrição -->
    <p class="text-sm text-gray-600 mb-4 line-clamp-2">
      {{ product.descricao }}
    </p>

    <!-- Preço -->
    <div class="text-2xl font-extrabold text-blue-600 mb-4">
      R$ {{ product.preco.toFixed(2) }}
    </div>

    <!-- Botão -->
    <span
      class="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
    >
      Comprar agora
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  product: {
    id: string
    nome: string
    slug: string
    descricao?: string | null
    preco: number
    imagem?: string | null
  }
}>()

// Caminho da imagem blindado para produção
const imageSrc = computed(() => {
  const img = props.product.imagem

  if (!img) {
    return '/images/product-placeholder.png'
  }

  // Se já vier absoluto, usa direto
  if (img.startsWith('/')) {
    return img
  }

  // Se vier só o nome do arquivo, normaliza
  return `/images/produto/${img}`
})
</script>
