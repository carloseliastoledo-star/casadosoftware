<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">

      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900">
          Nossos Produtos
        </h1>
        <p class="text-gray-600 mt-2">
          Escolha a licença ideal e receba por e-mail após confirmação.
        </p>
        <p v-if="q" class="text-sm text-gray-600 mt-3">
          Resultados para: <span class="font-semibold text-gray-900">{{ q }}</span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        Carregando produtos...
      </div>

      <!-- Erro -->
      <div v-else-if="error" class="text-center py-20 text-red-600">
        Erro ao carregar produtos.
      </div>

      <!-- Grid -->
      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in filteredProducts"
          :key="String(product.id) + String(product.imagem || product.image || '')"
          :product="product"
        />
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'

definePageMeta({ ssr: true })

const route = useRoute()

const q = computed(() => String(route.query.q || '').trim())

const baseUrl = useSiteUrl()

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/produtos` }] : []
}))

const { data, pending, error } = await useFetch('/api/products', {
  server: true
})

const products = computed(() => data.value || [])

const filteredProducts = computed(() => {
  const term = q.value.toLowerCase()
  if (!term) return products.value

  return (products.value as any[]).filter((p) => {
    const name = String(p?.nome ?? p?.name ?? '').toLowerCase()
    const slug = String(p?.slug ?? '').toLowerCase()
    return name.includes(term) || slug.includes(term)
  })
})
</script>
