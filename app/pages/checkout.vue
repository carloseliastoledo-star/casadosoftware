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
        <p class="text-gray-500 text-sm mt-1">Você está a um passo do seu {{ productName }}</p>
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
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="Licença será enviada para este e-mail"
                  autocomplete="email"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    v-model="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    autocomplete="tel"
                    maxlength="15"
                    @input="formatTelefone"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    v-model="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    inputmode="numeric"
                    maxlength="14"
                    @input="formatCpf"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Pagamento -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 class="font-bold text-gray-800 mb-3 text-xs uppercase tracking-widest">Forma de pagamento</h2>

            <!-- Tabs PIX / Cartão -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <button type="button" @click="paymentMethod = 'pix'"
                :class="paymentMethod === 'pix'
                  ? 'border-2 border-green-500 bg-green-50 text-green-700'
                  : 'border-2 border-gray-200 bg-white text-gray-500 hover:border-gray-300'"
                class="rounded-xl py-3 flex flex-col items-center gap-0.5 transition font-semibold text-sm">
                <span class="text-xl">⚡</span>
                <span>PIX</span>
                <span class="text-xs font-normal opacity-70">Instantâneo</span>
              </button>
              <button type="button" @click="paymentMethod = 'credit_card'"
                :class="paymentMethod === 'credit_card'
                  ? 'border-2 border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-2 border-gray-200 bg-white text-gray-500 hover:border-gray-300'"
                class="rounded-xl py-3 flex flex-col items-center gap-0.5 transition font-semibold text-sm">
                <span class="text-xl">💳</span>
                <span>Cartão</span>
                <span class="text-xs font-normal opacity-70">Crédito</span>
              </button>
            </div>

            <!-- PIX info -->
            <div v-if="paymentMethod === 'pix'" class="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
              <p class="text-xs font-semibold text-green-800 mb-1">Como funciona:</p>
              <ol class="text-xs text-green-700 list-decimal list-inside space-y-0.5">
                <li>Clique em &quot;Gerar PIX&quot;</li>
                <li>Escaneie o QR Code que aparecerá</li>
                <li>Aprovação em segundos — licença por e-mail</li>
              </ol>
            </div>

            <!-- Campos cartão -->
            <div v-if="paymentMethod === 'credit_card'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número do cartão</label>
                <input v-model="cardNumber" type="text" placeholder="0000 0000 0000 0000"
                  inputmode="numeric" maxlength="19" @input="formatCardNumber"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome no cartão</label>
                <input v-model="cardHolder" type="text" placeholder="Como aparece no cartão"
                  autocomplete="cc-name"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                  <input v-model="cardExpiry" type="text" placeholder="MM/AA"
                    inputmode="numeric" maxlength="5" @input="formatExpiry"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input v-model="cardCvv" type="text" placeholder="000"
                    inputmode="numeric" maxlength="4"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
              </div>
            </div>
          </div>

          <!-- Order Bump (só modo funnel) -->
          <div
            v-if="isFunnelMode"
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
                    <span class="font-bold text-gray-900 text-sm">{{ bumpConfig.title }}</span>
                  </div>
                  <span class="font-black text-green-700 text-sm whitespace-nowrap">+ R$ {{ bumpConfig.price.toFixed(2).replace('.', ',') }}</span>
                </div>
                <p class="mt-1.5 text-xs text-gray-600 leading-relaxed">{{ bumpConfig.description }}</p>
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
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{{ productName.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900">{{ productName }}</div>
                <div class="text-xs text-gray-500 mt-0.5">Licença digital • Entrega imediata</div>
              </div>
              <div class="text-sm font-bold text-gray-900 whitespace-nowrap">R$ {{ basePrice.toFixed(2).replace('.', ',') }}</div>
            </div>

            <!-- Order bump (linha condicional) -->
            <div v-if="orderBump" class="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span class="text-sm text-gray-700">{{ bumpConfig.title }}</span>
              <span class="text-sm font-semibold text-green-700">+ R$ {{ bumpConfig.price.toFixed(2).replace('.', ',') }}</span>
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

            <!-- QR Code PIX -->
            <div v-if="pixQrCode" class="mb-4 text-center">
              <p class="text-xs font-semibold text-green-700 mb-2">✅ PIX gerado! Escaneie para pagar:</p>
              <img :src="pixQrUrl" alt="QR Code PIX" class="w-44 h-44 mx-auto rounded-xl border border-gray-200" />
              <div class="mt-2 flex gap-1">
                <input :value="pixQrCode" readonly class="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 text-gray-600 truncate" />
                <button @click="copiarPix" class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                  {{ pixCopiado ? '✔' : 'Copiar' }}
                </button>
              </div>
              <button @click="handleAposPix" class="mt-3 w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl text-sm transition">
                Já realizei o pagamento →
              </button>
            </div>

            <!-- Erro -->
            <div v-if="paymentError" class="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {{ paymentError }}
            </div>

            <!-- CTA principal -->
            <button
              v-if="!pixQrCode"
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
                <span v-if="paymentMethod === 'pix'">⚡ GERAR PIX</span>
                <span v-else>🔒 FINALIZAR COMPRA</span>
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

const route = useRoute()
const { trackMeta, trackGtag, trackBeginCheckout, trackPurchase } = useTracking()

const trackingData = computed(() => ({
  utm_source:   String(route.query.utm_source   || '').trim() || undefined,
  utm_medium:   String(route.query.utm_medium   || '').trim() || undefined,
  utm_campaign: String(route.query.utm_campaign || '').trim() || undefined,
  utm_term:     String(route.query.utm_term     || '').trim() || undefined,
  utm_content:  String(route.query.utm_content  || '').trim() || undefined,
  gclid:        String(route.query.gclid        || '').trim() || undefined,
  fbclid:       String(route.query.fbclid       || '').trim() || undefined,
  referrer:     import.meta.client ? (document.referrer || undefined) : undefined,
  landingPage:  import.meta.client ? (window.location.href || undefined) : undefined,
}))

const FUNNEL_SLUG = 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const cpf = ref('')
const basePrice = ref(49)
const productName = ref('Office 365 Pro')
const produtoId = ref('')
const orderBump = ref(false)
const bumpConfig = ref({ title: 'Suporte premium de instalação', description: 'Receba ajuda prioritária para ativar seu produto sem complicação. Atendimento por WhatsApp em até 2h após a compra.', price: 19 })
const loading = ref(false)
const showValidation = ref(false)
const productLoading = ref(false)

const paymentMethod = ref<'pix' | 'credit_card'>('pix')
const cardNumber = ref('')
const cardHolder = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const pixQrCode = ref('')
const pixQrUrl = ref('')
const pixCopiado = ref(false)
const paymentError = ref('')
const funnelOrderId = ref('')
const pollingActive = ref(false)
const pollingTimer = ref<any>(null)

const productSlug = computed(() => String(route.query.product || ''))
const isFunnelMode = computed(() => !productSlug.value || productSlug.value === FUNNEL_SLUG)

const emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const totalPrice = computed(() => basePrice.value + (isFunnelMode.value && orderBump.value ? bumpConfig.value.price : 0))

useSeoMeta({
  title: computed(() => `Checkout — ${productName.value} | Casa do Software`),
  robots: 'noindex,nofollow'
})

const PIX_SESSION_KEY = 'checkout_pix_session'

function savePIXSession() {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(PIX_SESSION_KEY, JSON.stringify({
      pixQrCode: pixQrCode.value,
      pixQrUrl: pixQrUrl.value,
      funnelOrderId: funnelOrderId.value
    }))
  } catch {}
}

function clearPIXSession() {
  if (!import.meta.client) return
  try { sessionStorage.removeItem(PIX_SESSION_KEY) } catch {}
}

function restorePIXSession() {
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem(PIX_SESSION_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved?.pixQrCode || saved?.pixQrUrl) {
      pixQrCode.value = saved.pixQrCode || ''
      pixQrUrl.value = saved.pixQrUrl || ''
      funnelOrderId.value = saved.funnelOrderId || ''
    }
  } catch {}
}

onMounted(async () => {
  restorePIXSession()
  if (pixQrCode.value || pixQrUrl.value) return

  try {
    const cfg: any = await $fetch('/api/checkout-config')
    if (cfg?.orderBump) bumpConfig.value = { ...bumpConfig.value, ...cfg.orderBump }
  } catch {}

  if (productSlug.value && productSlug.value !== FUNNEL_SLUG) {
    productLoading.value = true
    try {
      const res: any = await $fetch(`/api/products/${productSlug.value}`)
      const p = res?.product || res
      productName.value = String(p?.nome || p?.name || productName.value)
      const price = Number(p?.preco ?? p?.price ?? p?.effectivePrice ?? 49)
      basePrice.value = price
      produtoId.value = String(p?.id || '')
    } catch {
      await navigateTo('/')
    } finally {
      productLoading.value = false
    }
  } else {
    productLoading.value = true
    try {
      const res: any = await $fetch(`/api/products/${FUNNEL_SLUG}`)
      const p = res?.product || res
      if (p?.id) {
        produtoId.value = String(p.id)
        productName.value = String(p?.nome || p?.name || 'Office 365 Pro')
        basePrice.value = Number(p?.preco ?? p?.price ?? p?.effectivePrice ?? 49)
      } else {
        productName.value = 'Office 365 Pro'
        basePrice.value = 49
      }
    } catch {
      productName.value = 'Office 365 Pro'
      basePrice.value = 49
    } finally {
      productLoading.value = false
    }
  }

  trackMeta('InitiateCheckout', { value: totalPrice.value })
  trackGtag('begin_checkout', { value: totalPrice.value })
})

onUnmounted(() => {
  stopPaymentPolling()
})

function formatTelefone(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 10) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  else if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
  else if (v.length > 0) v = `(${v}`
  telefone.value = v
}

function formatCpf(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9) v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
  else if (v.length > 6) v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
  else if (v.length > 3) v = `${v.slice(0, 3)}.${v.slice(3)}`
  cpf.value = v
}

function formatCardNumber(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  cardExpiry.value = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
}

async function copiarPix() {
  if (!import.meta.client) return
  try {
    await navigator.clipboard.writeText(pixQrCode.value)
    pixCopiado.value = true
    setTimeout(() => { pixCopiado.value = false }, 2000)
  } catch {}
}

function saveFunnelOrder(orderId: string) {
  if (!import.meta.client) return
  try {
    localStorage.setItem('funnelOrder', JSON.stringify({
      orderId,
      produto: productName.value,
      preco: basePrice.value,
      orderBump: isFunnelMode.value && orderBump.value,
      bumpProduto: (isFunnelMode.value && orderBump.value) ? bumpConfig.value.title : null,
      bumpPreco: (isFunnelMode.value && orderBump.value) ? bumpConfig.value.price : 0,
      total: totalPrice.value,
      totalFinal: null,
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefone.value.trim(),
      cpf: cpf.value.trim(),
      upsell: null
    }))
  } catch {}
}

async function startPaymentPolling() {
  if (!funnelOrderId.value || pollingActive.value) return
  pollingActive.value = true

  const checkStatus = async () => {
    try {
      const res: any = await $fetch('/api/order-status', { query: { orderId: funnelOrderId.value } })
      if (res?.order?.status === 'PAID') {
        stopPaymentPolling()
        clearPIXSession()
        saveFunnelOrder(funnelOrderId.value)
        trackMeta('Purchase', { value: totalPrice.value, currency: 'BRL' })
        trackGtag('purchase', { value: totalPrice.value, currency: 'BRL', transaction_id: funnelOrderId.value })
        if (isFunnelMode.value) {
          await navigateTo('/upsell/windows-11')
        } else {
          await navigateTo({ path: '/obrigado', query: { orderId: funnelOrderId.value } })
        }
      }
    } catch {
      // ignora erro, continua polling
    }
  }

  pollingTimer.value = setInterval(checkStatus, 3000)
  checkStatus()
}

function stopPaymentPolling() {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  pollingActive.value = false
}

async function handleAposPix() {
  stopPaymentPolling()
  clearPIXSession()
  saveFunnelOrder(funnelOrderId.value || ('cs-' + Date.now()))
  if (isFunnelMode.value) {
    await navigateTo('/upsell/windows-11')
  } else {
    await navigateTo({ path: '/obrigado', query: { orderId: funnelOrderId.value } })
  }
}

async function handleFinalize() {
  showValidation.value = true
  if (!nome.value.trim() || !emailValido.value || loading.value) return

  loading.value = true
  paymentError.value = ''

  try {
    const total = totalPrice.value
    trackMeta('InitiateCheckout', { value: total, currency: 'BRL' })
    trackGtag('begin_checkout', { value: total, currency: 'BRL' })

    const expiryParts = cardExpiry.value.split('/')
    const body: Record<string, unknown> = {
      produtoId: produtoId.value,
      email: email.value.trim(),
      nome: nome.value.trim(),
      document: cpf.value.replace(/\D/g, ''),
      phone: telefone.value.replace(/\D/g, ''),
      method: paymentMethod.value,
      orderBump: isFunnelMode.value && orderBump.value,
      currency: 'BRL',
      ...trackingData.value
    }

    if (paymentMethod.value === 'credit_card') {
      body.card = {
        number: cardNumber.value.replace(/\s/g, ''),
        holder_name: cardHolder.value.trim(),
        exp_month: parseInt(expiryParts[0] || '0', 10),
        exp_year: parseInt('20' + (expiryParts[1] || '0'), 10),
        cvv: cardCvv.value.trim()
      }
    }

    const result: any = await $fetch('/api/checkout', { method: 'POST', body })
    funnelOrderId.value = String(result?.orderId || 'cs-' + Date.now())

    if (paymentMethod.value === 'pix') {
      pixQrCode.value = result?.qrCode || ''
      pixQrUrl.value = result?.qrCodeUrl || ''
      if (!pixQrCode.value && !pixQrUrl.value) {
        saveFunnelOrder(funnelOrderId.value)
        clearPIXSession()
        await handleAposPix()
      } else {
        savePIXSession()
        startPaymentPolling()
      }
    } else {
      const status = String(result?.status || '').toLowerCase()
      if (status === 'paid' || status === 'approved') {
        saveFunnelOrder(funnelOrderId.value)
        trackMeta('Purchase', { value: total, currency: 'BRL' })
        trackGtag('purchase', { value: total, currency: 'BRL', transaction_id: funnelOrderId.value })
        if (isFunnelMode.value) {
          await navigateTo('/upsell/windows-11')
        } else {
          await navigateTo({ path: '/obrigado', query: { orderId: funnelOrderId.value } })
        }
      } else {
        paymentError.value = result?.message || 'Pagamento não aprovado. Verifique os dados do cartão.'
      }
    }
  } catch (e: any) {
    paymentError.value = e?.data?.statusMessage || e?.message || 'Erro ao processar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
