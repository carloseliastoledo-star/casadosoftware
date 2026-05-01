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
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center rounded-full bg-orange-100 px-4 py-1.5 text-xs font-black text-orange-700 mb-3">
          ⏳ Oferta válida hoje
        </div>
        <h1 class="text-2xl md:text-3xl font-black text-gray-900">⚡ Você está a 1 passo de ativar seu Office completo</h1>
        <p class="text-green-700 text-sm md:text-base font-bold mt-2">🔥 Entrega imediata após pagamento</p>
        <p class="text-yellow-600 text-sm font-black mt-2">⭐⭐⭐⭐⭐ Mais de 12.000 clientes atendidos</p>
      </div>

      <div class="text-center text-xs text-gray-500 mb-4">
        ✅ +3.842 clientes atendidos
        ⭐ 4.9/5 avaliações
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
                  @blur="trackField('name')"
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
                  @input="captureAbandonedCheckout"
                  @blur="trackField('email')"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div class="grid sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    v-model="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    autocomplete="tel"
                    maxlength="15"
                    @input="formatTelefone"
                    @blur="trackField('phone')"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CPF <span class="text-xs font-normal text-gray-500">(usado apenas para validar o pagamento com segurança)</span></label>
                  <input
                    v-model="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    inputmode="numeric"
                    maxlength="14"
                    @input="formatCpf"
                    @blur="trackField('cpf')"
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

          <!-- Cupom de desconto -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 class="font-bold text-gray-800 mb-3 text-xs uppercase tracking-widest">Cupom de desconto</h2>
            <div class="flex gap-2">
              <input
                v-model="couponCode"
                type="text"
                placeholder="Digite seu cupom"
                class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                @input="handleCouponInput"
              />
              <button
                type="button"
                @click="applyCoupon"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all"
              >
                <template v-if="applyingCoupon">
                  <svg class="animate-spin w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Aplicando...
                </template>
                <template v-else>Aplicar</template>
              </button>
            </div>
            <div v-if="couponError" class="mt-2 text-xs text-red-600">{{ couponError }}</div>
            <div v-if="couponSuccess" class="mt-2 text-xs text-green-600">{{ couponSuccess }}</div>
          </div>

          <!-- Order Bump (só modo funnel) -->
          <div
            v-if="isFunnelMode"
            class="border-2 border-orange-400 bg-orange-50 p-4 rounded-xl"
          >
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="orderBump" class="mt-1">

              <div>
                <p class="font-bold text-sm">
                  🔥 SUPORTE VIP + INSTALAÇÃO
                </p>

                <p class="text-xs text-gray-600">
                  De R$97 por apenas R$19
                </p>
              </div>
            </label>
          </div>

        </div>

        <!-- Coluna direita: resumo do pedido -->
        <div class="lg:w-72 xl:w-80 shrink-0">
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-4">
            <div class="mb-4 rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-center">
              <p class="text-xs font-black text-green-800">🔥 Seu Office completo liberado em minutos</p>
            </div>

            <h2 class="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">Resumo do pedido</h2>

            <!-- Produto principal -->
            <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{{ productName.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900">{{ productName }}</div>
                <div class="text-xs text-gray-500 mt-0.5">Licença digital • Word, Excel, PowerPoint, Outlook e Teams</div>
                <div class="text-xs text-green-700 font-semibold mt-1">Ativação rápida com suporte incluso</div>
              </div>
              <div class="text-base font-black text-green-700 whitespace-nowrap">R$ {{ basePrice.toFixed(2).replace('.', ',') }}</div>
            </div>

            <!-- Order bump (linha condicional) -->
            <div v-if="orderBump" class="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span class="text-sm text-gray-700">{{ bumpConfig.title }}</span>
              <span class="text-sm font-semibold text-green-700">+ R$ {{ bumpConfig.price.toFixed(2).replace('.', ',') }}</span>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between pt-3 mb-4">
              <span class="text-sm font-black text-gray-900">Total</span>
              <span class="text-3xl font-black text-green-600">
                R$ {{ totalPrice.toFixed(2).replace('.', ',') }}
              </span>
            </div>

            <!-- Benefícios -->
            <div class="space-y-1.5 mb-5">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Acesso ao Office completo
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Entrega digital em até 5 minutos
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="text-green-500 text-base leading-none">✔</span>
                Funciona em PC, Mac, iOS e Android
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
            <div v-if="!pixQrCode" class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p class="text-red-600 text-sm font-bold">
                🔥 Últimas licenças com esse preço
              </p>
              <p class="text-xs text-red-500">
                ⏰ Oferta expira em <span id="timer">{{ timerText }}</span>
              </p>
            </div>

            <button
              v-if="!pixQrCode"
              :disabled="loading"
              @click="handleGeneratePix"
              class="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <template v-if="loading">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Processando...
              </template>
              <template v-else>
                <span>⚡ ATIVAR MINHA LICENÇA AGORA</span>
              </template>
            </button>

            <div v-if="!pixQrCode" class="mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
              <div class="grid grid-cols-1 gap-2 text-xs font-semibold text-gray-700">
                <div class="flex items-center gap-2">
                  <span class="text-green-600">🔒</span>
                  Compra segura
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✔</span>
                  Entrega em até 5 minutos
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✔</span>
                  Suporte incluso
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✔</span>
                  Garantia
                </div>
              </div>
            </div>

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
const { trackMeta, trackGtag, trackBeginCheckout } = useTracking()
const { trackBeginCheckout: ecomBeginCheckout } = useEcommerceTracking()
const { captureBeforeCheckout, getAttributionForOrder } = useAttributionTracking()

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
  tracking:     import.meta.client ? getAttributionForOrder() : undefined,
}))

const FUNNEL_SLUG = 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const cpf = ref('')
const name = nome
const phone = telefone
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
const timerText = ref('09:59')
const abandonedCheckoutTimer = ref<any>(null)

// Cupom
const couponCode = ref('')
const applyingCoupon = ref(false)
const couponError = ref('')
const couponSuccess = ref('')
const appliedCoupon = ref<any>(null)

const productSlug = computed(() => String(route.query.product || ''))
const isFunnelMode = computed(() => !productSlug.value || productSlug.value === FUNNEL_SLUG)

const emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const totalPrice = computed(() => {
  const subtotal = basePrice.value + (isFunnelMode.value && orderBump.value ? bumpConfig.value.price : 0)
  if (appliedCoupon.value && appliedCoupon.value.percent) {
    const discount = subtotal * (appliedCoupon.value.percent / 100)
    return subtotal - discount
  }
  return subtotal
})

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

function trackField(field: string) {
  if (!import.meta.client) return
  try {
    const w = window as any
    if (w.gtag) {
      w.gtag('event', 'checkout_field_fill', { field })
    }
  } catch {}
}

function trackCheckoutAbandon() {
  try {
    const w = window as any
    if (w.gtag) {
      w.gtag('event', 'checkout_abandon', { step: 'form' })
    }

    const payload = JSON.stringify({
      email: email.value.trim(),
      phone: telefone.value.trim(),
      product: productSlug.value || 'office-365',
      status: 'abandoned'
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/abandoned-checkout', new Blob([payload], { type: 'application/json' }))
    } else {
      fetch('/api/abandoned-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      })
    }
  } catch {}
}

function captureAbandonedCheckout() {
  if (!import.meta.client) return

  if (abandonedCheckoutTimer.value) {
    clearTimeout(abandonedCheckoutTimer.value)
  }

  abandonedCheckoutTimer.value = setTimeout(() => {
    const leadEmail = email.value.trim()
    const leadPhone = telefone.value.trim()

    if (!leadEmail && !leadPhone) return

    fetch('/api/abandoned-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: leadEmail,
        phone: leadPhone,
        product: productSlug.value || 'office-365',
        status: 'started'
      })
    }).catch(() => {})
  }, 800)
}

onMounted(async () => {
  let time = 600
  const countdown = setInterval(() => {
    time--
    if (time < 0) {
      clearInterval(countdown)
      return
    }

    const min = Math.floor(time / 60)
    const sec = time % 60
    timerText.value = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`

    const el = document.getElementById('timer')
    if (el) {
      el.innerText = timerText.value
    }
  }, 1000)

  window.addEventListener('beforeunload', trackCheckoutAbandon)

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

  captureBeforeCheckout('mercado_pago')
  trackMeta('InitiateCheckout', { value: totalPrice.value })
  trackGtag('begin_checkout', { value: totalPrice.value })

  ecomBeginCheckout(
    [{ item_id: produtoId.value, item_name: productName.value, price: basePrice.value, item_category: 'Software' }],
    'BRL',
    totalPrice.value,
    'mercado_pago'
  )
})

onUnmounted(() => {
  stopPaymentPolling()
  if (abandonedCheckoutTimer.value) {
    clearTimeout(abandonedCheckoutTimer.value)
  }
  if (import.meta.client) {
    window.removeEventListener('beforeunload', trackCheckoutAbandon)
  }
})

function formatTelefone(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 10) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  else if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
  else if (v.length > 0) v = `(${v}`
  telefone.value = v
  captureAbandonedCheckout()
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

async function handleGeneratePix() {
  if (loading.value) return

  loading.value = true
  paymentError.value = ''

  try {
    const total = totalPrice.value
    captureBeforeCheckout('mercado_pago')
    trackMeta('InitiateCheckout', { value: total, currency: 'BRL' })
    trackGtag('begin_checkout', { value: total, currency: 'BRL' })
    trackGtag('generate_pix_click', { value: total, currency: 'BRL' })

    ecomBeginCheckout(
      [{ item_id: produtoId.value, item_name: productName.value, price: basePrice.value, item_category: 'Software' }],
      'BRL',
      total,
      'mercado_pago'
    )

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
      couponCode: appliedCoupon.value?.code || undefined,
      couponPercent: appliedCoupon.value?.percent || undefined,
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

    const result: any = await $fetch('/api/create-pix', {
      method: 'POST',
      body: {
        ...body,
        name: name.value,
        phone: phone.value
      }
    })
    funnelOrderId.value = String(result?.orderId || 'cs-' + Date.now())

    if (result?.checkoutUrl && import.meta.client) {
      window.location.href = result.checkoutUrl
      return
    }

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
    paymentError.value = e?.data?.statusMessage || e?.message || 'Erro ao gerar pagamento'
    if (import.meta.client) {
      alert('Erro ao gerar pagamento')
    }
  } finally {
    loading.value = false
  }
}

// Cupom functions
function handleCouponInput() {
  couponError.value = ''
  couponSuccess.value = ''
}

async function applyCoupon() {
  if (!couponCode.value.trim() || applyingCoupon.value) return

  applyingCoupon.value = true
  couponError.value = ''
  couponSuccess.value = ''

  const code = couponCode.value.trim()
  console.log('[checkout] Applying coupon:', code)
  console.log('[checkout] Code length:', code.length)
  console.log('[checkout] Code chars:', code.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' '))

  try {
    const url = `/api/coupons/${encodeURIComponent(code)}`
    console.log('[checkout] Fetching URL:', url)
    
    const res: any = await $fetch(url)
    console.log('[checkout] API response type:', typeof res)
    console.log('[checkout] API response:', res)
    
    const coupon = res?.coupon
    console.log('[checkout] Coupon object:', coupon)

    if (!coupon || !coupon.id || !coupon.code) {
      console.log('[checkout] Coupon invalid/missing:', coupon)
      couponError.value = 'Cupom inválido.'
      return
    }

    // Verificar validade
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      console.log('[checkout] Coupon expired:', coupon.expiresAt)
      couponError.value = 'Cupom expirado.'
      return
    }

    // Verificar limite de usos
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      console.log('[checkout] Coupon usage limit reached:', coupon.usedCount, '/', coupon.maxUses)
      couponError.value = 'Cupom já atingiu o limite de usos.'
      return
    }

    console.log('[checkout] Coupon applied successfully:', coupon)
    appliedCoupon.value = coupon
    couponSuccess.value = `Cupom aplicado! ${coupon.percent}% de desconto.`
    couponCode.value = ''
  } catch (e: any) {
    console.error('[checkout] Coupon validation error:', e)
    const statusCode = e?.statusCode || e?.status || e?.data?.statusCode || ''
    const statusMessage = e?.data?.statusMessage || e?.statusMessage || e?.message || 'Erro ao validar cupom.'
    couponError.value = statusCode ? `Erro ${statusCode}: ${statusMessage}` : statusMessage
  } finally {
    applyingCoupon.value = false
  }
}
</script>
