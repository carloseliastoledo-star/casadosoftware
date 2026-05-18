<script setup lang="ts">
const route = useRoute()

const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw.join("/") : String(raw || "")
})

const productSlug = computed(() => slug.value.replace(/^\/+|\/+$/g, ""))

const { data: product, error } = await useFetch(
  () => `/api/products/${productSlug.value}`,
  {
    key: () => `product-${productSlug.value}`,
    server: true,
    lazy: false
  }
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "Produto não encontrado" })
}

useHead({ title: computed(() => (product.value as any)?.name || (product.value as any)?.nome || "Produto") })
</script>

<template>
  <main style="padding:40px">
    <h1>{{ (product as any)?.name || (product as any)?.nome || productSlug }}</h1>
    <p>Slug: {{ productSlug }}</p>
    <pre v-if="product">{{ JSON.stringify(product, null, 2) }}</pre>
    <p v-else>Produto não encontrado</p>
  </main>
</template>
