<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 py-10">

      <!-- HEADER -->
      <div class="flex items-center gap-3 mb-8">
        <NuxtLink to="/" class="text-slate-500 hover:text-slate-700 transition text-sm">← Back</NuxtLink>
        <span class="text-slate-300">/</span>
        <span class="text-sm font-semibold text-slate-700">Secure Checkout</span>
        <div class="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
          <span>🔒</span>
          <span>Secured by Stripe</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

        <!-- LEFT: FORM -->
        <div class="lg:col-span-3 space-y-6">

          <!-- PRODUCT SUMMARY (mobile top) -->
          <div class="lg:hidden bg-white border border-slate-200 rounded-2xl p-5">
            <ProductSummaryCard :product="product" :currency="currency" :price="effectivePrice" :loading="productLoading" :error="priceError" />
          </div>

          <!-- CURRENCY SELECTOR -->
          <div class="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Currency</h2>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="cur in ['usd', 'eur']"
                :key="cur"
                @click="setCurrency(cur as 'usd' | 'eur')"
                :class="currency === cur
                  ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold'
                  : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
                class="rounded-xl py-3 flex flex-col items-center gap-1 transition text-sm"
              >
                <span class="text-lg">{{ cur === 'usd' ? '🇺🇸' : '🇪🇺' }}</span>
                <span>{{ cur === 'usd' ? 'USD — US Dollar' : 'EUR — Euro' }}</span>
              </button>
            </div>
          </div>

          <!-- CONTACT INFO -->
          <div class="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Contact Information</h2>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Email Address <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-400 bg-red-50': showValidation && !isEmailValid }"
              />
              <p v-if="showValidation && !isEmailValid" class="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
              <p class="text-xs text-slate-400 mt-1">Your license key will be sent to this email.</p>
            </div>
          </div>

          <!-- STRIPE PAYMENT -->
          <div class="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Payment Details</h2>

            <!-- Price error (no intl price configured) -->
            <div v-if="priceError" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div class="flex items-start gap-2">
                <span class="text-amber-500 text-lg">⚠️</span>
                <div>
                  <p class="text-sm font-semibold text-amber-800">Price not available</p>
                  <p class="text-xs text-amber-700 mt-0.5">{{ priceError }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="!clientSecret && !paymentLoading">
              <p class="text-sm text-slate-500 mb-4">
                Click <strong>Pay Now</strong> to be charged
                <strong class="text-slate-900">{{ formattedPrice }}</strong>
                and receive your license key by email.
              </p>
            </div>

            <!-- Stripe Elements container -->
            <div v-if="clientSecret && !paymentDone" class="mb-4">
              <div id="stripe-payment-element" class="border border-slate-200 rounded-xl p-3 min-h-[120px]" />
              <div v-if="stripeError" class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {{ stripeError }}
              </div>
            </div>

            <!-- Success -->
            <div v-if="paymentDone" class="text-center py-6">
              <div class="text-5xl mb-3">🎉</div>
              <h3 class="text-xl font-extrabold text-slate-900 mb-2">Payment successful!</h3>
              <p class="text-sm text-slate-500">Your license key is on its way to <strong>{{ form.email }}</strong>.</p>
            </div>

            <!-- Pay button -->
            <button
              v-if="!paymentDone"
              @click="handlePayment"
              :disabled="paymentLoading || !!priceError || productLoading"
              class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <template v-if="paymentLoading">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </template>
              <template v-else-if="clientSecret">
                🔒 Complete Payment — {{ formattedPrice }}
              </template>
              <template v-else>
                🔒 Pay Now — {{ formattedPrice }}
              </template>
            </button>

            <div v-if="!paymentDone" class="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>🔐 SSL Encrypted</span>
              <span>💳 Stripe Secure</span>
              <span>🌍 Global Payments</span>
            </div>
          </div>

        </div>

        <!-- RIGHT: ORDER SUMMARY (desktop) -->
        <div class="hidden lg:block lg:col-span-2">
          <div class="bg-white border border-slate-200 rounded-2xl p-5 sticky top-8">
            <h2 class="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Order Summary</h2>
            <ProductSummaryCard :product="product" :currency="currency" :price="effectivePrice" :loading="productLoading" :error="priceError" />

            <div v-if="!priceError && effectivePrice > 0" class="mt-4 pt-4 border-t border-slate-100">
              <div class="flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>{{ formattedPrice }}</span>
              </div>
            </div>

            <div class="mt-6 space-y-2 text-xs text-slate-500">
              <div class="flex items-center gap-2"><span>⚡</span> Instant email delivery</div>
              <div class="flex items-center gap-2"><span>✅</span> Genuine license key</div>
              <div class="flex items-center gap-2"><span>🔒</span> Secure payment by Stripe</div>
              <div class="flex items-center gap-2"><span>🤝</span> Customer support included</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'default' })

useSeoMeta({ title: 'Secure Checkout', robots: 'noindex,nofollow' })

const route = useRoute()
const router = useRouter()

const productSlug = computed(() => String(route.query.product || '').trim())
const currency = ref<'usd' | 'eur'>('usd')

const form = ref({ name: '', email: '' })
const showValidation = ref(false)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))

const paymentLoading = ref(false)
const stripeError = ref('')
const clientSecret = ref('')
const orderId = ref('')
const paymentDone = ref(false)

let stripeInstance: any = null
let stripeElements: any = null

function setCurrency(cur: 'usd' | 'eur') {
  currency.value = cur
  clientSecret.value = ''
  stripeError.value = ''
  stripeElements = null
}

// --- Product loading ---
interface IntlProduct {
  id: string
  nome: string
  slug: string
  imagem: string | null
  descricao: string | null
  usdPrice: number | null
  eurPrice: number | null
}

const product = ref<IntlProduct | null>(null)
const productLoading = ref(true)
const priceError = ref('')

const effectivePrice = computed(() => {
  if (!product.value) return 0
  const p = currency.value === 'usd' ? product.value.usdPrice : product.value.eurPrice
  return p ?? 0
})

const formattedPrice = computed(() => {
  if (!effectivePrice.value) return '—'
  const sym = currency.value === 'usd' ? '$' : '€'
  return `${sym}${Number(effectivePrice.value).toFixed(2)} ${currency.value.toUpperCase()}`
})

async function loadProduct() {
  if (!productSlug.value) {
    priceError.value = 'No product selected.'
    productLoading.value = false
    return
  }
  productLoading.value = true
  priceError.value = ''
  try {
    const data: any = await $fetch('/api/intl/products')
    const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.produtos) ? data.produtos : []
    const p = list.find((x: any) => x.slug === productSlug.value)

    if (!p) {
      priceError.value = 'Product not found.'
      return
    }

    const rawDesc = String(p?.descricao || p?.description || '')
      .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const descShort = rawDesc.length > 120 ? rawDesc.slice(0, 120) + '…' : rawDesc

    product.value = {
      id: String(p?.id || ''),
      nome: String(p?.name || p?.nome || ''),
      slug: String(p?.slug || productSlug.value),
      imagem: p?.image || p?.imagem || null,
      descricao: descShort || null,
      usdPrice: p?.usdPrice ? Number(p.usdPrice) : null,
      eurPrice: p?.eurPrice ? Number(p.eurPrice) : null,
    }
  } catch (err: any) {
    priceError.value = err?.data?.statusMessage || 'Product not found.'
  } finally {
    productLoading.value = false
  }
}

watch(currency, () => {
  priceError.value = ''
  if (product.value) {
    const price = currency.value === 'usd' ? product.value.usdPrice : product.value.eurPrice
    if (!price || price <= 0) {
      priceError.value = `This product does not have a price in ${currency.value.toUpperCase()}. Please select another currency or contact support.`
    }
  }
}, { immediate: false })

// --- Payment flow ---
async function loadStripe() {
  if (!import.meta.client) return null
  const w = window as any
  if (w.Stripe) return w.Stripe
  await new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
  return (window as any).Stripe
}

async function handlePayment() {
  showValidation.value = true
  stripeError.value = ''

  if (!isEmailValid.value) return
  if (!product.value?.id) return
  if (priceError.value) return
  if (paymentLoading.value) return

  paymentLoading.value = true

  try {
    if (!clientSecret.value) {
      const res: any = await $fetch('/api/intl/payment-intent', {
        method: 'POST',
        body: {
          produtoId: product.value.id,
          email: form.value.email,
          nome: form.value.name || undefined,
          currency: currency.value,
        }
      })

      if (!res?.clientSecret) throw new Error('Failed to initialize payment')

      clientSecret.value = res.clientSecret
      orderId.value = res.orderId || ''

      await nextTick()
      await mountStripeElements(res.clientSecret, res.publishableKey)
    } else {
      await confirmPayment()
    }
  } catch (err: any) {
    stripeError.value = err?.data?.statusMessage || err?.message || 'Payment failed. Please try again.'
  } finally {
    paymentLoading.value = false
  }
}

async function mountStripeElements(secret: string, publishableKey: string) {
  const StripeConstructor = await loadStripe()
  if (!StripeConstructor || !publishableKey) {
    stripeError.value = 'Stripe failed to load. Please refresh and try again.'
    return
  }

  stripeInstance = StripeConstructor(publishableKey)
  stripeElements = stripeInstance.elements({ clientSecret: secret, appearance: { theme: 'stripe' } })

  const paymentElement = stripeElements.create('payment')
  paymentElement.mount('#stripe-payment-element')
}

async function confirmPayment() {
  if (!stripeInstance || !stripeElements) return
  paymentLoading.value = true
  try {
    const { error } = await stripeInstance.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        return_url: `${window.location.origin}/obrigado?orderId=${orderId.value}`,
        receipt_email: form.value.email,
      },
      redirect: 'if_required',
    })

    if (error) {
      stripeError.value = error.message || 'Payment declined. Please check your card details.'
    } else {
      paymentDone.value = true
      router.push({ path: '/obrigado', query: { orderId: orderId.value } })
    }
  } finally {
    paymentLoading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<!-- Inline sub-component: ProductSummaryCard -->
<script lang="ts">
import { defineComponent, computed } from 'vue'
const ProductSummaryCard = defineComponent({
  name: 'ProductSummaryCard',
  props: {
    product: { type: Object as () => any, default: null },
    currency: { type: String as () => 'usd' | 'eur', default: 'usd' },
    price: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  setup(props) {
    const sym = computed(() => props.currency === 'usd' ? '$' : '€')
    const formatted = computed(() =>
      props.price > 0 ? `${sym.value}${Number(props.price).toFixed(2)} ${props.currency.toUpperCase()}` : '—'
    )
    return { formatted }
  },
  template: `
    <div>
      <div v-if="loading" class="animate-pulse space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-100 rounded w-3/4" />
            <div class="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>
      <div v-else-if="product">
        <div class="flex items-start gap-4">
          <img
            v-if="product.imagem || product.image"
            :src="product.imagem || product.image"
            :alt="product.nome || product.name"
            class="w-20 h-20 object-contain rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
          />
          <div class="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl" v-else>📦</div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-900 text-sm leading-snug">{{ product.nome || product.name }}</p>
            <p v-if="product.descricao" class="text-xs text-slate-500 mt-1 leading-relaxed">{{ product.descricao }}</p>
            <p v-else class="text-xs text-slate-500 mt-0.5">Digital license — instant delivery</p>
            <p v-if="!error" class="text-base font-extrabold text-blue-600 mt-2">{{ formatted }}</p>
            <p v-else class="text-xs text-amber-600 mt-1">Price unavailable</p>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-slate-400 text-center py-4">No product selected.</div>
    </div>
  `
})
export { ProductSummaryCard }
</script>
