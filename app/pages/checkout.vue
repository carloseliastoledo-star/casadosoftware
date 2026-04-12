<template>
  <div class="min-h-screen bg-[#f5f5f7] font-sans">

    <!-- Trust bar -->
    <div class="bg-[#0a1628] text-white text-xs py-2.5">
      <div class="max-w-3xl mx-auto px-5 flex items-center justify-center gap-6 flex-wrap">
        <span>🔒 Compra 100% segura</span>
        <span>⚡ Entrega imediata</span>
        <span>🛡️ Garantia 30 dias</span>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-5 py-8">

      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-black text-gray-900">Finalize seu pedido</h1>
        <p class="text-gray-500 text-sm mt-1">Você está a um passo do seu Office 365 Pro</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Coluna esquerda: formulário + order bump -->
        <div class="flex-1 space-y-4">

          <!-- Dados do comprador -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 class="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">Seus dados</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input
                  v-model="nome"
                  type="text"
                  placeholder="Como está no documento"
                  autocomplete="name"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="Licença será enviada para este e-mail"
                  autocomplete="email"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <!-- Order Bump -->
          <div
            :class="[
              'rounded-2xl border-2 p-5 cursor-pointer select-none transition-all',
              orderBump
                ? 'border-green-500 bg-green-50 shadow-sm'
                : 'border-dashed border-gray-300 bg-white hover:border-green-400 hover:bg-green-50/40'
            ]"
            role="checkbox"
            :aria-checked="orderBump"
            tabindex="0"
            @click="orderBump = !orderBump"
            @keydown.space.prevent="orderBump = !orderBump"
          >
            <div class="flex items-start gap-3">
              <div
                :class="[
                  'mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  orderBump ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                ]"
              >
                <svg v-if="orderBump" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">SIM! QUERO</span>
                    <span class="font-bold text-gray-900 text-sm">Suporte premium de instalação</span>
                  </div>
                  <span class="font-black text-green-700 text-sm whitespace-nowrap">+ R$ 19,00</span>
                </div>
                <p class="mt-1.5 text-xs text-gray-600 leading-relaxed">
                  Receba ajuda prioritária para ativar seu Office sem complicação. Atendimento por WhatsApp em até 2h após a compra.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Coluna direita: resumo do pedido -->
        <div class="lg:w-72 xl:w-80 shrink-0">
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-4">
            <h2 class="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">Resumo do pedido</h2>

            <!-- Produto principal -->
            <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">O</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900">Office 365 Pro</div>
                <div class="text-xs text-gray-500 mt-0.5">Licença vitalícia • Entrega digital</div>
              </div>
              <div class="text-sm font-bold text-gray-900 whitespace-nowrap">R$ 49,00</div>
            </div>

            <!-- Order bump (linha condicional) -->
            <div v-if="orderBump" class="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span class="text-sm text-gray-700">Suporte premium</span>
              <span class="text-sm font-semibold text-green-700">+ R$ 19,00</span>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between pt-3 mb-4">
              <span class="text-sm font-black text-gray-900">Total</span>
              <span class="text-2xl font-black text-green-600">
                R$ {{ totalPrice.toFixed(2).replace('.', ',') }}
              </span>
            </div>

            <!-- Benefícios -->
            <div class="space-y-1.5 mb-5">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Entrega digital em até 5 minutos
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Licença original para PC, Mac, iOS e Android
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Suporte especializado incluso
              </div>
            </div>

            <!-- CTA principal -->
            <button
              :disabled="loading || !nome.trim() || !emailValido"
              @click="handleFinalize"
              class="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-green-200 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <template v-if="loading">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Processando...
              </template>
              <template v-else>
                🔒 FINALIZAR COMPRA
              </template>
            </button>

            <!-- Validação inline -->
            <p v-if="showValidation && (!nome.trim() || !emailValido)" class="mt-2 text-xs text-red-500 text-center">
              Preencha nome e e-mail válido para continuar.
            </p>

            <p class="mt-3 text-center text-xs text-gray-400">
              Pagamento seguro • Entrega após confirmação
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp' })

useSeoMeta({
  title: 'Checkout — Office 365 Pro | Casa do Software',
  robots: 'noindex,nofollow'
})

const { trackMeta, trackGtag } = useMarketing()

const nome = ref('')
const email = ref('')
const basePrice = ref(49)
const orderBump = ref(false)
const loading = ref(false)
const showValidation = ref(false)

const emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const totalPrice = computed(() => basePrice.value + (orderBump.value ? 19 : 0))

onMounted(() => {
  trackMeta('InitiateCheckout', { value: totalPrice.value })
  trackGtag('begin_checkout', { value: totalPrice.value })
})

async function handleFinalize() {
  showValidation.value = true
  if (!nome.value.trim() || !emailValido.value || loading.value) return

  loading.value = true
  try {
    if (import.meta.client) {
      localStorage.setItem('funnelOrder', JSON.stringify({
        produto: 'Office 365 Pro',
        preco: basePrice.value,
        orderBump: orderBump.value,
        bumpProduto: orderBump.value ? 'Suporte premium de instalação' : null,
        bumpPreco: orderBump.value ? 19 : 0,
        total: totalPrice.value,
        nome: nome.value.trim(),
        email: email.value.trim(),
        upsell: null
      }))
    }

    await new Promise(r => setTimeout(r, 1400))
    await navigateTo('/upsell/windows-11')
  } finally {
    loading.value = false
  }
}
</script>
