<script setup lang="ts">
const route = useRoute()

console.log("[TESTE-PRODUTO-SSR] rota carregou:", route.params.slug)

useHead({
  title: "Teste Produto SSR"
})
</script>

<template>
  <main style="padding:40px">
    <h1>Produto SSR funcionando</h1>
    <p>Slug: {{ route.params.slug }}</p>
  </main>
</template>
