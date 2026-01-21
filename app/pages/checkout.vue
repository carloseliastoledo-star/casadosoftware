<template>
  <section class="bg-gray-50 min-h-screen py-20">
    <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
      <!-- PRODUTO -->
      <div v-if="product" class="bg-white rounded-3xl shadow p-10">
        <div class="flex gap-8 items-center">
          <img
            :src="product.image"
            :alt="product.name"
            class="w-32 object-contain"
          />

          <div>
            <h1 class="text-2xl font-bold mb-2">
              {{ product.name }}
            </h1>
            <p class="text-gray-600">
              {{ product.shortDescription }}
            </p>
          </div>
        </div>

        <div class="mt-10 grid grid-cols-2 gap-4 text-sm">
          <div class="flex items-center gap-2">⚡ Envio imediato</div>
          <div class="flex items-center gap-2">🛡️ Licença original</div>
          <div class="flex items-center gap-2">♻️ Reinstalação permitida</div>
          <div class="flex items-center gap-2">💬 Suporte especializado</div>
        </div>
      </div>

      <!-- RESUMO -->
      <div class="bg-white rounded-3xl shadow p-10">
        <h2 class="text-xl font-bold mb-6">
          Resumo do Pedido
        </h2>

        <div v-if="product" class="space-y-4 mb-6">
          <div class="flex justify-between">
            <span>{{ product.name }}</span>
            <span>R$ {{ product.price.toFixed(2).replace('.', ',') }}</span>
          </div>

          <div class="flex justify-between text-sm text-gray-500">
            <span>Desconto promocional</span>
            <span>-40%</span>
          </div>

          <!-- PARCELAMENTO VISÍVEL -->
          <div class="flex justify-between text-sm text-gray-600">
            <span>Parcelamento</span>
            <span>
              12x de R$ {{
                (product.price / 12)
                  .toFixed(2)
                  .replace('.', ',')
              }}
            </span>
          </div>

          <div class="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span class="text-blue-600">
              R$ {{ product.price.toFixed(2).replace('.', ',') }}
            </span>
          </div>
        </div>

        <!-- URGÊNCIA -->
        <div
          class="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-sm mb-6"
        >
          🔥 Oferta por tempo limitado — preço pode mudar a qualquer momento
        </div>

     <!-- SELOS DE CARTÃO -->
<div class="flex justify-center gap-4 my-6 text-sm font-semibold text-gray-500">
  <span class="px-3 py-1 border rounded">VISA</span>
  <span class="px-3 py-1 border rounded">Mastercard</span>
  <span class="px-3 py-1 border rounded">Amex</span>
</div>


        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email para receber a licença
          </label>
          <input
            v-model="customerEmail"
            type="email"
            placeholder="seuemail@exemplo.com"
            class="w-full border p-3 rounded-xl"
          />
          <p class="text-xs text-gray-500 mt-2">
            Use um email válido. Após a confirmação do pagamento, sua licença será enviada automaticamente.
          </p>
        </div>

        <!-- BOTÃO PAGAMENTO (PIX) -->
        <button
          :disabled="pixLoading"
          @click="goToPix"
          class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg transition disabled:opacity-60"
        >
          {{ pixLoading ? 'Gerando PIX...' : 'Pagar com PIX' }}
        </button>

        <div v-if="pixError" class="mt-4 text-sm text-red-600">
          {{ pixError }}
        </div>

        <div v-if="pix.qrCodeBase64 || pix.qrCode" class="mt-6 bg-gray-50 border rounded-xl p-4">
          <div class="font-semibold mb-3">PIX gerado</div>
          <img v-if="pix.qrCodeBase64" :src="pix.qrCodeBase64" alt="QR Code PIX" class="w-56 mx-auto" />

          <div v-if="pix.qrCode" class="mt-4">
            <div class="text-sm font-medium text-gray-700 mb-2">Copia e cola</div>
            <textarea
              readonly
              class="w-full border rounded-lg p-3 text-xs"
              rows="4"
            >{{ pix.qrCode }}</textarea>
          </div>
        </div>

        <p class="text-xs text-gray-500 text-center mt-4">
          Pagamento 100% seguro • Processado pelo Mercado Pago
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const slug = computed(() => String(route.query.product || ''))

const { data } = await useFetch(
  () => (slug.value ? `/api/products/${slug.value}` : null),
  { server: false }
)

const product = computed(() => {
  const p: any = data.value
  if (!p) return null

  return {
    ...p,
    shortDescription: p.shortDescription ?? p.description ?? ''
  }
})

const customerEmail = ref('')
const pixLoading = ref(false)
const pixError = ref('')
const pix = reactive<{ qrCode: string; qrCodeBase64: string | null }>({
  qrCode: '',
  qrCodeBase64: null
})

async function goToPix() {
  if (!product.value) return

  pixLoading.value = true
  pixError.value = ''
  pix.qrCode = ''
  pix.qrCodeBase64 = null

  try {
    const res: any = await $fetch('/api/mercadopago/pix', {
      method: 'POST',
      body: {
        produtoId: product.value.id,
        email: customerEmail.value
      }
    })

    pix.qrCode = res.qrCode || ''
    pix.qrCodeBase64 = res.qrCodeBase64 || null
  } catch (err: any) {
    pixError.value = err?.data?.statusMessage || 'Não foi possível gerar o PIX'
  } finally {
    pixLoading.value = false
  }
}
</script>
