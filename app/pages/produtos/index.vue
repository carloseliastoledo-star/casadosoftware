<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">

      <div class="mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900">
          {{ ui.title }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ ui.subtitle }}
        </p>
        <p v-if="q" class="text-sm text-gray-600 mt-3">
          {{ ui.resultsFor }}: <span class="font-semibold text-gray-900">{{ q }}</span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        {{ ui.loading }}
      </div>

      <!-- Erro -->
      <div v-else-if="error" class="text-center py-20 text-red-600">
        {{ ui.error }}
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

const intl = useIntlContext()

const q = computed(() => String(route.query.q || '').trim())

const baseUrl = useSiteUrl()

const productsIndexPath = computed(() => {
  return intl.language.value === 'en' ? '/products' : '/produtos'
})

const ui = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'Products',
      subtitle: 'Choose the ideal license and receive it by email after confirmation.',
      resultsFor: 'Results for',
      loading: 'Loading products...',
      error: 'Failed to load products.'
    }
  }
  return {
    title: 'Nossos Produtos',
    subtitle: 'Escolha a licença ideal e receba por e-mail após confirmação.',
    resultsFor: 'Resultados para',
    loading: 'Carregando produtos...',
    error: 'Erro ao carregar produtos.'
  }
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}${productsIndexPath.value}` }] : []
}))

const { data, pending, error } = await useFetch('/api/products', {
  server: true,
  default: () => null
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
