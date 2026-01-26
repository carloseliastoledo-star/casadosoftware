<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-6xl mx-auto px-6">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">
        Finalize Seu Pedido
      </h1>

      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <div class="relative">
                <input
                  v-model="customerEmail"
                  type="email"
                  placeholder="seuemail@gmail.com"
                  class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Whatsapp</label>
              <input
                v-model="whatsapp"
                type="tel"
                placeholder="Ex: (00) 00000-0000"
                class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                v-model="nome"
                type="text"
                placeholder="Ex: Roberto da Silva"
                class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">CPF</label>
              <input
                v-model="cpf"
                inputmode="numeric"
                placeholder="Ex: 050.***.768-**"
                class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
              />
            </div>
          </div>

          <div class="mt-8">
            <div class="text-sm font-semibold text-gray-800 mb-3">Métodos de pagamento</div>
            <div class="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                @click="paymentTab = 'pix'"
                :class="paymentTab === 'pix' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'"
                class="flex items-center justify-between gap-3 border rounded-xl p-4 bg-white"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">P</div>
                  <div class="text-left">
                    <div class="text-sm font-semibold text-gray-900">Pix</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">Desconto 5%</span>
                  <span class="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                    <span v-if="paymentTab === 'pix'" class="w-2 h-2 rounded-full bg-blue-600"></span>
                  </span>
                </div>
              </button>

              <button
                type="button"
                @click="paymentTab = 'card'"
                :class="paymentTab === 'card' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'"
                class="flex items-center justify-between gap-3 border rounded-xl p-4 bg-white"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold">C</div>
                  <div class="text-left">
                    <div class="text-sm font-semibold text-gray-900">Cartão de Crédito</div>
                  </div>
                </div>
                <span class="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                  <span v-if="paymentTab === 'card'" class="w-2 h-2 rounded-full bg-blue-600"></span>
                </span>
              </button>
            </div>
          </div>

          <div class="mt-8">
            <template v-if="paymentTab === 'pix'">
              <div v-if="pixError" class="mt-4 text-sm text-red-600">
                {{ pixError }}
              </div>

              <div v-if="pix.qrCodeBase64 || pix.qrCode" class="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div class="font-semibold mb-3">PIX gerado</div>
                <img v-if="pix.qrCodeBase64" :src="pix.qrCodeBase64" alt="QR Code PIX" class="w-56 mx-auto" />

                <div v-if="pix.qrCode" class="mt-4">
                  <div class="text-sm font-medium text-gray-700 mb-2">Copia e cola</div>
                  <textarea
                    readonly
                    class="w-full border border-gray-200 rounded-lg p-3 text-xs bg-white"
                    rows="4"
                  >{{ pix.qrCode }}</textarea>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="cardSdkError" class="mt-4 text-sm text-red-600">
                {{ cardSdkError }}
              </div>

              <div class="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div class="font-semibold mb-3">Dados do cartão</div>
                <div id="mp-card-form" class="space-y-3">
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Número do cartão</label>
                      <input id="form-cardNumber" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Nome no cartão</label>
                      <input id="form-cardholderName" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Mês</label>
                      <input id="form-cardExpirationMonth" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Ano</label>
                      <input id="form-cardExpirationYear" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">CVV</label>
                      <input id="form-securityCode" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Bandeira</label>
                      <select id="form-paymentMethodId" class="w-full border border-gray-200 p-3 rounded-xl bg-white"></select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Parcelas</label>
                      <select id="form-installments" class="w-full border border-gray-200 p-3 rounded-xl bg-white"></select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Emissor</label>
                      <select id="form-issuer" class="w-full border border-gray-200 p-3 rounded-xl bg-white"></select>
                    </div>
                    <input id="form-identificationType" type="hidden" value="CPF" />
                    <input id="form-identificationNumber" :value="cpf" type="hidden" />
                  </div>
                </div>
              </div>

              <div v-if="cardError" class="mt-4 text-sm text-red-600">
                {{ cardError }}
              </div>
            </template>

            <p class="text-xs text-gray-500 mt-6">
              Licenças digitais originais com entrega instantânea.
            </p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>

          <div v-if="product" class="space-y-4">
            <div class="border border-gray-200 bg-gray-50 rounded-xl p-4">
              <div class="text-sm font-semibold text-gray-900">Cupom de desconto</div>
              <div class="mt-3 flex gap-3">
                <input
                  v-model="couponInput"
                  class="flex-1 border border-gray-200 bg-white p-3 rounded-xl"
                  placeholder="Digite seu cupom"
                  :disabled="applyingCoupon || !!appliedCoupon"
                />
                <button
                  v-if="!appliedCoupon"
                  type="button"
                  class="bg-gray-900 text-white px-4 rounded-xl disabled:opacity-60"
                  :disabled="applyingCoupon || !couponInput"
                  @click="applyCoupon"
                >
                  {{ applyingCoupon ? 'Aplicando...' : 'Aplicar' }}
                </button>
                <button
                  v-else
                  type="button"
                  class="border border-gray-300 text-gray-800 px-4 rounded-xl"
                  @click="removeCoupon"
                >
                  Remover
                </button>
              </div>
              <div v-if="couponError" class="mt-2 text-xs text-red-600">{{ couponError }}</div>
              <div v-if="appliedCoupon" class="mt-2 text-xs text-green-700">
                Cupom aplicado: <span class="font-bold">{{ appliedCoupon.code }}</span> ({{ appliedCoupon.percent }}%)
              </div>
            </div>

            <div class="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span class="font-semibold text-gray-900">R$ {{ subtotal.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div class="flex justify-between text-sm text-gray-600">
              <span>Desconto</span>
              <span class="font-semibold text-green-700">- R$ {{ desconto.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div class="border-t pt-4 flex justify-between items-center">
              <span class="text-sm text-gray-600">Total</span>
              <span class="text-2xl font-bold text-gray-900">R$ {{ total.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div class="mt-4 border border-gray-200 bg-gray-50 rounded-xl p-4">
              <label class="flex items-start gap-3 text-sm text-gray-700">
                <input v-model="acceptedTerms" type="checkbox" class="mt-1" />
                <span>
                  Aceito os
                  <a href="/legal/termos" class="text-blue-600 hover:underline">Termos de Uso</a>,
                  <a href="/legal/privacidade" class="text-blue-600 hover:underline">Política de Privacidade</a>
                  e
                  <a href="/politica-de-devolucao" class="text-blue-600 hover:underline">Política de Devolução</a>
                </span>
              </label>
            </div>

            <button
              :disabled="finalizeLoading || !acceptedTerms"
              @click="finalizeCheckout"
              class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {{ finalizeLoading ? 'Processando...' : 'Finalizar Compra' }}
            </button>

            <div v-if="finalizeError" class="mt-3 text-sm text-red-600">
              {{ finalizeError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const config = useRuntimeConfig()

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

const paymentTab = ref<'pix' | 'card'>('pix')

const customerEmail = ref('')
const whatsapp = ref('')
const nome = ref('')
const pixLoading = ref(false)
const pixError = ref('')
const pix = reactive<{ qrCode: string; qrCodeBase64: string | null }>({
  qrCode: '',
  qrCodeBase64: null
})

const pixOrderId = ref('')
const pixPaymentId = ref('')
const pixPolling = ref(false)

const PIX_ORDER_STORAGE_KEY = 'checkout_pix_order_id'
const PIX_PAYMENT_STORAGE_KEY = 'checkout_pix_payment_id'

const cpf = ref('')
const acceptedTerms = ref(false)
const finalizeLoading = ref(false)
const finalizeError = ref('')

const subtotal = computed(() => Number(product.value?.price || 0))
const desconto = computed(() => {
  const base = subtotal.value
  if (!base) return 0
  const pixDiscount = paymentTab.value === 'pix' ? Math.round(base * 0.05 * 100) / 100 : 0
  const couponDiscount = appliedCoupon.value ? Math.round(base * (appliedCoupon.value.percent / 100) * 100) / 100 : 0
  return Math.round((pixDiscount + couponDiscount) * 100) / 100
})
const total = computed(() => Math.max(0, Math.round((subtotal.value - desconto.value) * 100) / 100))
const cardLoading = ref(false)
const cardError = ref('')
const cardSdkError = ref('')
let mpCardForm: any = null

const couponInput = ref('')
const appliedCoupon = ref<{ id: string; code: string; percent: number } | null>(null)
const couponError = ref('')
const applyingCoupon = ref(false)

function loadMpSdk() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if ((window as any).MercadoPago) return resolve()

    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar SDK Mercado Pago'))
    document.head.appendChild(script)
  })
}

async function initCardForm() {
  if (typeof window === 'undefined') return
  if (mpCardForm) return

  const publicKey = String(config.public.mercadopagoPublicKey || '')
  if (!publicKey) {
    cardSdkError.value = 'MERCADOPAGO_PUBLIC_KEY não configurada'
    return
  }

  try {
    await loadMpSdk()
    const MercadoPago = (window as any).MercadoPago
    const mp = new MercadoPago(publicKey, { locale: 'pt-BR' })

    mpCardForm = mp.cardForm({
      amount: String(total.value || 0),
      autoMount: true,
      form: {
        id: 'mp-card-form',
        cardholderName: { id: 'form-cardholderName' },
        cardNumber: { id: 'form-cardNumber' },
        cardExpirationMonth: { id: 'form-cardExpirationMonth' },
        cardExpirationYear: { id: 'form-cardExpirationYear' },
        securityCode: { id: 'form-securityCode' },
        installments: { id: 'form-installments' },
        identificationType: { id: 'form-identificationType' },
        identificationNumber: { id: 'form-identificationNumber' },
        issuer: { id: 'form-issuer' },
        paymentMethodId: { id: 'form-paymentMethodId' }
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) cardSdkError.value = 'Erro ao montar formulário do cartão'
        }
      }
    })
  } catch {
    cardSdkError.value = 'Falha ao iniciar checkout com cartão'
  }
}

watch(paymentTab, async (tab) => {
  if (tab === 'card') {
    await nextTick()
    await initCardForm()
  }
})

async function payWithCard() {
  if (!product.value) return
  cardLoading.value = true
  cardError.value = ''

  try {
    if (!mpCardForm) {
      await initCardForm()
    }

    if (!mpCardForm) {
      throw new Error('Checkout de cartão indisponível')
    }

    const cardData = mpCardForm.getCardFormData()
    const res: any = await $fetch('/api/mercadopago/card', {
      method: 'POST',
      body: {
        produtoId: product.value.id,
        email: customerEmail.value,
        couponCode: appliedCoupon.value?.code || null,
        token: cardData.token,
        payment_method_id: cardData.paymentMethodId,
        issuer_id: cardData.issuerId,
        installments: Number(cardData.installments || 1),
        identification: {
          type: 'CPF',
          number: cpf.value
        }
      }
    })

    if (String(res.status || '').toLowerCase() === 'approved') {
      navigateTo({
        path: '/obrigado',
        query: {
          orderId: res.orderId,
          paymentId: res.paymentId
        }
      })
    } else {
      cardError.value = 'Pagamento enviado para análise. Aguarde a confirmação.'
    }
  } catch (err: any) {
    cardError.value = err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento'
  } finally {
    cardLoading.value = false
  }
}

async function finalizeCheckout() {
  if (!product.value) return

  finalizeLoading.value = true
  finalizeError.value = ''

  try {
    if (!acceptedTerms.value) {
      finalizeError.value = 'Você precisa aceitar os termos para continuar.'
      return
    }

    if (!customerEmail.value || !customerEmail.value.includes('@')) {
      finalizeError.value = 'Informe um e-mail válido.'
      return
    }

    if (!cpf.value) {
      finalizeError.value = 'Informe o CPF.'
      return
    }

    if (paymentTab.value === 'pix') {
      await goToPix()
      return
    }

    await payWithCard()
  } finally {
    finalizeLoading.value = false
  }
}

async function goToPix() {
  if (!product.value) return

  pixLoading.value = true
  pixError.value = ''
  pix.qrCode = ''
  pix.qrCodeBase64 = null
  pixOrderId.value = ''
  pixPaymentId.value = ''

  try {
    const res: any = await $fetch('/api/mercadopago/pix', {
      method: 'POST',
      body: {
        produtoId: product.value.id,
        email: customerEmail.value,
        nome: nome.value,
        whatsapp: whatsapp.value,
        cpf: cpf.value,
        couponCode: appliedCoupon.value?.code || null
      }
    })

    pixOrderId.value = String(res.orderId || '')
    pixPaymentId.value = String(res.paymentId || '')

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PIX_ORDER_STORAGE_KEY, pixOrderId.value)
        window.localStorage.setItem(PIX_PAYMENT_STORAGE_KEY, pixPaymentId.value)
      } catch {
        // ignore
      }
    }

    if (pixOrderId.value) {
      navigateTo(
        {
          path: '/checkout',
          query: {
            ...(route.query || {}),
            orderId: pixOrderId.value,
            paymentId: pixPaymentId.value || undefined
          }
        },
        { replace: true }
      )
    }

    pix.qrCode = res.qrCode || ''
    pix.qrCodeBase64 = res.qrCodeBase64 || null

    if (pixOrderId.value) {
      startPixStatusPolling()
    }
  } catch (err: any) {
    pixError.value = err?.data?.statusMessage || 'Não foi possível gerar o PIX'
  } finally {
    pixLoading.value = false
  }
}

async function startPixStatusPolling() {
  if (pixPolling.value) return
  if (!pixOrderId.value) return

  pixPolling.value = true
  try {
    const startedAt = Date.now()

    while (Date.now() - startedAt < 10 * 60 * 1000) {
      const res: any = await $fetch('/api/order-status', {
        query: { orderId: pixOrderId.value }
      })

      const status = String(res?.order?.status || '').toUpperCase()
      if (status === 'PAID') {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(PIX_ORDER_STORAGE_KEY)
            window.localStorage.removeItem(PIX_PAYMENT_STORAGE_KEY)
          } catch {
            // ignore
          }
        }
        navigateTo({
          path: '/obrigado',
          query: {
            orderId: pixOrderId.value,
            paymentId: pixPaymentId.value || undefined
          }
        })
        return
      }

      await new Promise((r) => setTimeout(r, 4000))
    }
  } catch {
    // ignora: usuário ainda pode pagar e o webhook confirmar depois
  } finally {
    pixPolling.value = false
  }
}

async function applyCoupon() {
  if (!product.value) return
  couponError.value = ''
  applyingCoupon.value = true
  try {
    const res: any = await $fetch('/api/coupons/apply', {
      method: 'POST',
      body: {
        produtoId: product.value.id,
        paymentMethod: paymentTab.value,
        code: couponInput.value
      }
    })

    appliedCoupon.value = res.coupon
    couponInput.value = ''

    if (paymentTab.value === 'card') {
      mpCardForm = null
      await nextTick()
      await initCardForm()
    }
  } catch (err: any) {
    couponError.value = err?.data?.statusMessage || err?.message || 'Cupom inválido'
    appliedCoupon.value = null
  } finally {
    applyingCoupon.value = false
  }
}

function removeCoupon() {
  appliedCoupon.value = null
  couponError.value = ''
  if (paymentTab.value === 'card') {
    mpCardForm = null
    nextTick(() => initCardForm())
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return

  const qOrderId = String(route.query.orderId || '').trim()
  const qPaymentId = String(route.query.paymentId || '').trim()

  if (qOrderId) {
    pixOrderId.value = qOrderId
    if (qPaymentId) pixPaymentId.value = qPaymentId
    startPixStatusPolling()
    return
  }

  try {
    const savedOrderId = String(window.localStorage.getItem(PIX_ORDER_STORAGE_KEY) || '').trim()
    const savedPaymentId = String(window.localStorage.getItem(PIX_PAYMENT_STORAGE_KEY) || '').trim()
    if (savedOrderId) {
      pixOrderId.value = savedOrderId
      if (savedPaymentId) pixPaymentId.value = savedPaymentId
      startPixStatusPolling()
    }
  } catch {
    // ignore
  }
})
</script>
