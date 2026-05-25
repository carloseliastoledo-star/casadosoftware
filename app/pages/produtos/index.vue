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
      <div v-else>
        <h2 v-if="!q" class="text-2xl font-bold text-gray-900 mb-6">{{ ui.productsTitle }}</h2>
        <div v-if="filteredProducts.length > 0" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="String(product.id)"
            :product="product"
          />
        </div>
        <div v-else class="text-center py-20 text-gray-500">
          {{ ui.noProducts }}
        </div>
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
      subtitle: 'Find digital licenses for Windows, Office, Autodesk, antivirus and other software solutions.',
      resultsFor: 'Results for',
      loading: 'Loading products...',
      error: 'Failed to load products.',
      categoriesTitle: 'Choose by category',
      productsTitle: 'All products',
      viewCategory: 'View products',
      noProducts: 'No products found.'
    }
  }
  return {
    title: 'Produtos',
    subtitle: 'Encontre licenças digitais para Windows, Office, Autodesk, antivírus e outras soluções de software.',
    resultsFor: 'Resultados para',
    loading: 'Carregando produtos...',
    error: 'Erro ao carregar produtos.',
    categoriesTitle: 'Escolha por categoria',
    productsTitle: 'Todos os produtos',
    viewCategory: 'Ver produtos',
    noProducts: 'Nenhum produto encontrado.'
  }
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}${productsIndexPath.value}` }] : []
}))

const { data: productsData, pending, error } = await useFetch('/api/products')

const products = computed(() => productsData.value || [])

const filteredProducts = computed(() => {
  const term = q.value.toLowerCase()
  if (!term) return products.value

  return (products.value as any[]).filter((p) => {
    const name = String(p?.name ?? '').toLowerCase()
    const slug = String(p?.slug ?? '').toLowerCase()

    // Direct match
    if (name.includes(term) || slug.includes(term)) return true

    // Autodesk-related terms
    const autodeskTerms = ['autocad', 'revit', 'maya', 'inventor', 'civil 3d', '3ds max', 'fusion', 'navisworks']
    if (term === 'autodesk' && autodeskTerms.some(at => name.includes(at))) return true

    return false
  })
})

</script>
