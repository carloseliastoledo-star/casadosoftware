<script setup lang="ts">
import { useCart } from '~/composables/useCart'

const route = useRoute()
const { clearCart } = useCart()

onMounted(() => {
  // Limpar o carrinho após pagamento bem-sucedido
  clearCart()
  
  navigateTo({
    path: '/obrigado',
    query: route.query
  })
})
</script>

<template>
  <section class="bg-gray-50 min-h-screen py-16">
    <div class="max-w-2xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h1 class="text-2xl font-bold text-gray-900">Redirecionando...</h1>
      </div>
    </div>
  </section>
</template>
