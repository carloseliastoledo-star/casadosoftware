<template>
  <div class="min-h-screen bg-[#0a1628] text-white font-sans">

    <!-- Barra de confirmação -->
    <div class="bg-green-500 text-white text-center py-3 text-sm font-bold tracking-wide">
      ✅ Seu Office 365 Pro está confirmado! Confira a oferta abaixo antes de sair.
    </div>

    <div class="max-w-2xl mx-auto px-5 py-10 text-center">

      <!-- Headline -->
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3">
        Seu Office já está garantido.<br />
        <span class="text-yellow-400">Aproveite e leve Windows 11 Pro com desconto exclusivo</span>
      </h1>
      <p class="text-blue-200 text-base mb-8 max-w-lg mx-auto">
        Oferta exclusiva de pós-compra — disponível <strong class="text-white">apenas agora</strong>, por tempo limitado.
      </p>

      <!-- Card de preço -->
      <div class="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-10 py-6 mb-8">
        <span class="text-gray-400 line-through text-sm mb-1">De R$ 197,00</span>
        <span class="text-green-400 text-5xl font-black">R$ 97,00</span>
        <span class="text-yellow-300 text-xs font-bold uppercase tracking-widest mt-2">
          ⚡ Oferta única — não aparece depois
        </span>
      </div>

      <!-- Cards de benefícios -->
      <div class="grid grid-cols-3 gap-3 mb-8 text-left">
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <div class="text-2xl mb-1.5" aria-hidden="true">🚀</div>
          <div class="font-bold text-sm leading-snug">Ativação em minutos</div>
          <div class="text-blue-300 text-xs mt-1">Entrega digital imediata</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <div class="text-2xl mb-1.5" aria-hidden="true">🔑</div>
          <div class="font-bold text-sm leading-snug">Licença original</div>
          <div class="text-blue-300 text-xs mt-1">Windows 11 Pro genuíno</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <div class="text-2xl mb-1.5" aria-hidden="true">💻</div>
          <div class="font-bold text-sm leading-snug">Para 1 PC</div>
          <div class="text-blue-300 text-xs mt-1">Todos os PCs compatíveis</div>
        </div>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col gap-3 max-w-sm mx-auto">

        <!-- Aceitar -->
        <button
          :disabled="loading"
          @click="handleAccept"
          class="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-60 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-green-900/40 transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <template v-if="loading">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Adicionando...
          </template>
          <template v-else>
            🎁 ADICIONAR WINDOWS 11 AO MEU PEDIDO
          </template>
        </button>

        <!-- Recusar -->
        <button
          :disabled="loading"
          @click="handleDecline"
          class="w-full text-gray-400 hover:text-gray-200 text-sm py-3 transition underline underline-offset-2 disabled:opacity-40"
        >
          Não, obrigado. Continuar sem Windows 11.
        </button>

      </div>

      <p class="mt-6 text-blue-400 text-xs max-w-xs mx-auto">
        ⚠ Esta oferta não estará disponível depois que sair desta página.
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp' })

useSeoMeta({
  title: 'Oferta exclusiva — Windows 11 Pro | Casa do Software',
  robots: 'noindex,nofollow'
})

const { trackMeta, trackGtag } = useMarketing()
const loading = ref(false)

onMounted(() => {
  trackMeta('ViewContent', { content_name: 'Upsell Windows 11 Pro', value: 97 })
  trackGtag('view_item', { value: 97, currency: 'BRL', item_name: 'Windows 11 Pro Upsell' })
})

function saveFunnelUpsell(status: 'accepted' | 'declined') {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('funnelOrder')
    const existing = raw ? JSON.parse(raw) : {}
    const baseTotal = Number(existing.total ?? 0)
    const extra = status === 'accepted'
      ? {
          upsell: 'accepted',
          upsellProduto: 'Windows 11 Pro',
          upsellPreco: 97,
          totalFinal: baseTotal + 97
        }
      : {
          upsell: 'declined',
          totalFinal: baseTotal
        }
    localStorage.setItem('funnelOrder', JSON.stringify({ ...existing, ...extra }))
  } catch {}
}

async function handleAccept() {
  if (loading.value) return
  loading.value = true

  trackMeta('AddToCart', { value: 97, content_name: 'Windows 11 Pro', content_type: 'product' })
  trackGtag('add_to_cart', { value: 97, currency: 'BRL', item_name: 'Windows 11 Pro' })

  saveFunnelUpsell('accepted')
  await navigateTo('/obrigado?upsell=accepted')
}

async function handleDecline() {
  if (loading.value) return

  trackGtag('select_content', { content_type: 'upsell_declined', content_id: 'windows-11' })

  saveFunnelUpsell('declined')
  await navigateTo('/obrigado?upsell=declined')
}
</script>
