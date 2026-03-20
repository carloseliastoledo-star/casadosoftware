<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route    = useRoute()
const checkout = useCheckout()

const parentOrderId   = String(route.query.orderId    || '')
const productId       = String(route.query.productId  || '')
const cardToken       = String(route.query.cardToken  || '')
const stripeCustomer  = String(route.query.sc         || '')
const stripePayMethod = String(route.query.pm         || '')

const product  = ref<any>(null)
const accepted = ref(false)
const declined = ref(false)

onMounted(async () => {
  if (!parentOrderId || !productId) {
    navigateTo('/obrigado')
    return
  }
  try {
    const data: any = await $fetch(`/api/products/${productId}`)
    product.value = data?.produto ?? data
  } catch {
    navigateTo('/obrigado')
  }
})

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

async function accept() {
  if (accepted.value || checkout.loading.value) return
  accepted.value = true
  try {
    await checkout.submitUpsell({
      parentOrderId,
      upsellProductId: productId,
      cardToken:             cardToken || undefined,
      stripeCustomerId:      stripeCustomer  || undefined,
      stripePaymentMethodId: stripePayMethod || undefined,
    })
    navigateTo({ path: '/obrigado', query: { orderId: parentOrderId, upsell: '1' } })
  } catch {
    accepted.value = false
  }
}

function decline() {
  declined.value = true
  navigateTo({ path: '/obrigado', query: { orderId: parentOrderId } })
}
</script>

<template>
  <section class="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
    <div v-if="product" class="max-w-xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">

      <!-- Header urgência -->
      <div class="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-white text-center">
        <p class="text-xs font-semibold uppercase tracking-wider mb-1">⚡ Oferta exclusiva — apenas agora</p>
        <p class="text-sm opacity-90">Esta oferta desaparece quando você sair desta página</p>
      </div>

      <div class="p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          Adicione <span class="text-blue-600">{{ product.nome }}</span> com 1 clique
        </h1>
        <p class="text-gray-500 text-sm mb-6">{{ product.descricao?.replace(/<[^>]*>/g, '').substring(0, 160) + '...' || '' }}</p>

        <!-- Preço -->
        <div class="flex items-baseline gap-3 mb-6">
          <span v-if="product.precoAntigo" class="text-gray-400 line-through text-lg">
            {{ fmt(product.precoAntigo) }}
          </span>
          <span class="text-3xl font-extrabold text-green-600">{{ fmt(product.preco) }}</span>
          <span class="text-sm text-gray-500">pagamento único</span>
        </div>

        <!-- Benefícios -->
        <ul v-if="product.cardItems" class="space-y-2 mb-8">
          <li
            v-for="item in JSON.parse(product.cardItems)"
            :key="item"
            class="flex items-center gap-2 text-sm text-gray-700"
          >
            <span class="text-green-500 font-bold">✓</span> {{ item }}
          </li>
        </ul>

        <!-- Erro -->
        <p v-if="checkout.error.value" class="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-4 py-2">
          {{ checkout.error.value }}
        </p>

        <!-- CTAs -->
        <button
          @click="accept"
          :disabled="checkout.loading.value || accepted"
          class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition mb-3"
        >
          <span v-if="checkout.loading.value">Processando...</span>
          <span v-else>Sim! Quero adicionar por {{ fmt(product.preco) }}</span>
        </button>

        <button
          @click="decline"
          :disabled="checkout.loading.value"
          class="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition"
        >
          Não obrigado, vou deixar passar esta oportunidade
        </button>
      </div>
    </div>

    <div v-else class="text-gray-400">Carregando oferta...</div>
  </section>
</template>
