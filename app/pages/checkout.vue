<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div v-if="useStripeCheckout" class="max-w-3xl mx-auto px-6">
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold text-gray-900">{{ intlTitle }}</h1>
        <p class="text-gray-600 mt-2">{{ intlSubtitle }}</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ intlEmailLabel }}</label>
            <input
              v-model="customerEmail"
              type="email"
              placeholder="you@example.com"
              class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ intlNameLabel }}</label>
            <input
              v-model="nome"
              type="text"
              placeholder="Full name"
              class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ intlCountryLabel }}</label>
            <select
              v-model="intlCountryCode"
              class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
            >
              <option value="">{{ intlCountryPlaceholder }}</option>
              <optgroup label="South America">
                <option value="AR">Argentina</option>
                <option value="BO">Bolivia</option>
                <option value="BR">Brazil</option>
                <option value="CL">Chile</option>
                <option value="CO">Colombia</option>
                <option value="EC">Ecuador</option>
                <option value="PY">Paraguay</option>
                <option value="PE">Peru</option>
                <option value="UY">Uruguay</option>
                <option value="VE">Venezuela</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="FR">France</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="PT">Portugal</option>
                <option value="UK">United Kingdom</option>
              </optgroup>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ intlCurrencyLabel }}</label>
            <select
              v-model="intlCurrency"
              class="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-0 p-3 rounded-xl"
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </div>
        </div>

        <div v-if="intlError" class="mt-4 text-sm text-red-600">
          {{ intlError }}
        </div>

        <div class="mt-6 border border-gray-200 rounded-2xl overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <div class="font-semibold text-gray-900">{{ intlPaymentTitle }}</div>
              <div class="text-xs text-gray-600">{{ intlPaymentSubtitle }}</div>
            </div>
            <div v-if="intlAmountFormatted" class="text-sm font-extrabold text-gray-900">
              {{ intlAmountFormatted }}
            </div>
          </div>
          <div class="p-4 bg-white">
            <div id="stripe-payment-element" class="min-h-[44px]" />
          </div>
        </div>

        <button
          :disabled="stripeLoading || !product || !customerEmail || !acceptedTerms"
          @click="payWithStripe"
          class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-sm transition disabled:opacity-60"
        >
          {{ stripeLoading ? intlPayLoadingLabel : intlPayLabel }}
        </button>

        <div class="mt-4 border border-gray-200 bg-gray-50 rounded-xl p-4">
          <label class="flex items-start gap-3 text-sm text-gray-700">
            <input v-model="acceptedTerms" type="checkbox" class="mt-1" />
            <span>
              {{ intlTermsPrefix }}
              <a href="/termos" class="text-blue-600 hover:underline">{{ intlTermsLink }}</a>,
              <a href="/privacidade" class="text-blue-600 hover:underline">{{ intlPrivacyLink }}</a>
              {{ intlTermsAnd }}
              <a href="/reembolso" class="text-blue-600 hover:underline">{{ intlRefundLink }}</a>
            </span>
          </label>
        </div>
      </div>
    </div>

    <div v-else class="max-w-6xl mx-auto px-6">
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold text-gray-900">
          Finalize seu pedido
        </h1>
        <p class="text-gray-600 mt-2">
          Preencha seus dados e escolha a forma de pagamento.
        </p>
      </div>

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

              <div v-if="pix.qrCodeBase64 || pix.qrCode" class="mt-6 border border-gray-200 rounded-2xl overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <div class="font-semibold text-gray-900">PIX gerado</div>
                    <div class="text-xs text-gray-600">Abra o app do banco e pague pelo QR Code ou pelo código copia e cola.</div>
                  </div>
                  <div v-if="pixCopied" class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                    Copiado
                  </div>
                </div>

                <div class="p-4 bg-white">
                  <div class="grid md:grid-cols-2 gap-6 items-start">
                    <div class="flex items-center justify-center">
                      <img v-if="pix.qrCodeBase64" :src="pix.qrCodeBase64" alt="QR Code PIX" class="w-56" />
                    </div>

                    <div v-if="pix.qrCode" class="space-y-3">
                      <div class="text-sm font-semibold text-gray-900">Copia e cola</div>
                      <textarea
                        readonly
                        class="w-full border border-gray-200 rounded-xl p-3 text-xs bg-gray-50"
                        rows="5"
                      >{{ pix.qrCode }}</textarea>
                      <button
                        type="button"
                        class="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl disabled:opacity-60"
                        :disabled="!pix.qrCode"
                        @click="copyPixCode"
                      >
                        Copiar código PIX
                      </button>
                      <div v-if="pixCopyError" class="text-xs text-red-600">{{ pixCopyError }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="cardSdkError" class="mt-4 text-sm text-red-600">
                {{ cardSdkError }}
              </div>

              <div class="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div class="font-semibold mb-3">Dados do cartão</div>
                <form id="mp-card-form" class="space-y-3" @submit.prevent>
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Número do cartão</label>
                      <input id="form-cardNumber" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Nome no cartão</label>
                      <input id="form-cardholderName" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Mês</label>
                      <input id="form-cardExpirationMonth" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">Ano</label>
                      <input id="form-cardExpirationYear" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-1">CVV</label>
                      <input id="form-securityCode" class="w-full border border-gray-200 p-3 rounded-xl bg-white" />
                    </div>
                  </div>

                  <div class="sr-only">
                    <select id="form-paymentMethodId"></select>
                    <select id="form-installments"></select>
                    <select id="form-issuer"></select>
                    <input id="form-identificationType" type="hidden" value="CPF" />
                    <input id="form-identificationNumber" :value="cpf" type="hidden" />
                  </div>
                </form>
              </div>

              <div v-if="cardError" class="mt-4 text-sm text-red-600">
                {{ cardError }}
              </div>
            </template>

            <p class="text-xs text-gray-500 mt-6">
              Licenças digitais com envio imediato após confirmação.
            </p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>

          <div v-if="product" class="mb-6 border border-gray-200 bg-white rounded-xl p-4">
            <div class="flex gap-4">
              <img
                :src="productImage"
                :alt="productName"
                class="w-16 h-16 rounded-lg bg-gray-50 object-contain"
                referrerpolicy="no-referrer"
                @error="onProductImageError"
              />

              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ productName }}</div>
                <div class="text-xs text-gray-600 mt-1">Entrega digital • Envio por e-mail após confirmação</div>
                <div class="mt-3 flex items-end justify-between gap-3">
                  <div class="text-lg font-extrabold text-gray-900">{{ formattedSubtotal }}</div>
                  <div class="text-xs text-gray-600">em até 12x de {{ formattedInstallment12 }}</div>
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-2 text-xs text-gray-700">
              <div class="flex items-center gap-2">
                <span class="text-emerald-600">✔</span>
                Compra segura
              </div>
              <div class="flex items-center gap-2">
                <span class="text-emerald-600">✔</span>
                Devolução grátis. Até 7 dias
              </div>
              <div class="flex items-center gap-2">
                <span class="text-emerald-600">✔</span>
                Suporte especializado
              </div>
            </div>
          </div>

          <div class="mb-6 border border-gray-200 bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
            <div class="font-semibold text-gray-900">Compra segura</div>
            <div class="mt-2">
              Utilizamos criptografia segura para proteger seus dados durante o processamento, garantindo mais segurança na compra.
            </div>
          </div>

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
                  <a href="/termos" class="text-blue-600 hover:underline">Termos de Uso</a>,
                  <a href="/privacidade" class="text-blue-600 hover:underline">Política de Privacidade</a>
                  e
                  <a href="/reembolso" class="text-blue-600 hover:underline">Política de Reembolso</a>
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
import { useIntlContext } from '#imports'
import { trackBeginCheckout } from '~/services/analytics'

const intl = useIntlContext()
const route = useRoute()
const config = useRuntimeConfig()

const isIntl = computed(() => intl.isIntl.value)

const useStripeCheckout = computed(() => {
  const c = String(intl.countryCode.value || '').trim().toUpperCase()
  if (!c) return false
  return c !== 'BR'
})

const { siteName } = useSiteBranding()
const baseUrl = useSiteUrl()

useSeoMeta({
  title: `Checkout | ${siteName}`
})

useHead(() => ({
  meta: [{ name: 'robots', content: 'noindex,nofollow' }],
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/checkout` }] : []
}))

const utmSource = computed(() => (route.query.utm_source ? String(route.query.utm_source) : undefined))
const utmMedium = computed(() => (route.query.utm_medium ? String(route.query.utm_medium) : undefined))
const utmCampaign = computed(() => (route.query.utm_campaign ? String(route.query.utm_campaign) : undefined))
const utmTerm = computed(() => (route.query.utm_term ? String(route.query.utm_term) : undefined))
const utmContent = computed(() => (route.query.utm_content ? String(route.query.utm_content) : undefined))
const gclid = computed(() => (route.query.gclid ? String(route.query.gclid) : undefined))
const fbclid = computed(() => (route.query.fbclid ? String(route.query.fbclid) : undefined))

const referrer = ref<string | undefined>(undefined)
const landingPage = ref<string | undefined>(undefined)

onMounted(() => {
  try {
    referrer.value = document?.referrer ? String(document.referrer) : undefined
  } catch {
    referrer.value = undefined
  }

  try {
    landingPage.value = window?.location?.href ? String(window.location.href) : undefined
  } catch {
    landingPage.value = undefined
  }
})

const attributionPayload = computed(() => ({
  utm_source: utmSource.value || undefined,
  utm_medium: utmMedium.value || undefined,
  utm_campaign: utmCampaign.value || undefined,
  utm_term: utmTerm.value || undefined,
  utm_content: utmContent.value || undefined,
  gclid: gclid.value || undefined,
  fbclid: fbclid.value || undefined,
  referrer: referrer.value || undefined,
  landingPage: landingPage.value || undefined
}))

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

const beginCheckoutTracked = ref(false)

watch(
  () => product.value,
  (p) => {
    if (!import.meta.client) return
    if (beginCheckoutTracked.value) return
    if (!p) return

    beginCheckoutTracked.value = true

    try {
      trackBeginCheckout({
        currency: String((p as any)?.currency || 'BRL'),
        total: Number((p as any)?.price ?? (p as any)?.preco ?? 0),
        items: [
          {
            item_id: String((p as any)?.id || ''),
            item_name: String((p as any)?.nome || (p as any)?.name || ''),
            price: Number((p as any)?.price ?? (p as any)?.preco ?? 0),
            quantity: 1
          }
        ]
      })
    } catch {
      // ignore
    }
  },
  { immediate: true }
)

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

const pixCopied = ref(false)
const pixCopyError = ref('')

const PIX_ORDER_STORAGE_KEY = 'checkout_pix_order_id'
const PIX_PAYMENT_STORAGE_KEY = 'checkout_pix_payment_id'

const cpf = ref('')
const acceptedTerms = ref(false)
const finalizeLoading = ref(false)
const finalizeError = ref('')

const intlError = ref('')

const intlCountryCode = ref(String(intl.countryCode.value || '').trim().toUpperCase())
const intlCurrency = ref<'usd' | 'eur'>(
  (String(intl.currencyLower.value || 'usd').toLowerCase() === 'eur' ? 'eur' : 'usd') as any
)

watch(
  () => intl.countryCode.value,
  (next) => {
    const v = String(next || '').trim().toUpperCase()
    if (intlCountryCode.value === v) return
    intlCountryCode.value = v

    const cur = String(intl.currencyLower.value || '').toLowerCase()
    if (cur === 'eur') intlCurrency.value = 'eur'
    else if (cur === 'usd') intlCurrency.value = 'usd'
  },
  { immediate: true }
)

const stripeOrderId = ref<string | null>(null)
const stripeAmount = ref<number | null>(null)
const stripeCurrency = ref<'usd' | 'eur'>('usd')
const stripeLoading = ref(false)
let stripeInstance: any = null
let stripeElements: any = null
let stripePaymentElement: any = null

function tIntl(pt: string, en: string, es: string) {
  return intl.language.value === 'en' ? en : intl.language.value === 'es' ? es : pt
}

const intlTitle = computed(() => tIntl('Finalize seu pedido', 'Checkout', 'Finalizar compra'))
const intlSubtitle = computed(() =>
  tIntl(
    'Preencha seus dados e escolha a forma de pagamento.',
    'Enter your details and complete payment securely.',
    'Completa tus datos y paga de forma segura.'
  )
)
const intlEmailLabel = computed(() => tIntl('E-mail', 'Email', 'Correo'))
const intlNameLabel = computed(() => tIntl('Nome', 'Name', 'Nombre'))
const intlCountryLabel = computed(() => tIntl('País', 'Country', 'País'))
const intlCountryPlaceholder = computed(() => tIntl('Selecione...', 'Select...', 'Selecciona...'))
const intlCurrencyLabel = computed(() => tIntl('Moeda', 'Currency', 'Moneda'))
const intlPaymentTitle = computed(() => tIntl('Pagamento', 'Payment', 'Pago'))
const intlPaymentSubtitle = computed(() => tIntl('Cartão e métodos suportados pela Stripe.', 'Card and supported methods powered by Stripe.', 'Tarjeta y métodos compatibles con Stripe.'))
const intlPayLabel = computed(() => tIntl('Pagar', 'Pay now', 'Pagar ahora'))
const intlPayLoadingLabel = computed(() => tIntl('Processando...', 'Processing...', 'Procesando...'))
const intlTermsPrefix = computed(() => tIntl('Aceito os', 'I accept the', 'Acepto los'))
const intlTermsLink = computed(() => tIntl('Termos de Uso', 'Terms of Use', 'Términos de uso'))
const intlPrivacyLink = computed(() => tIntl('Política de Privacidade', 'Privacy Policy', 'Política de privacidad'))
const intlRefundLink = computed(() => tIntl('Política de Reembolso', 'Refund Policy', 'Política de reembolso'))
const intlTermsAnd = computed(() => tIntl('e', 'and', 'y'))

const intlAmountFormatted = computed(() => {
  if (!stripeAmount.value) return null
  const currency = stripeCurrency.value || intlCurrency.value
  try {
    return new Intl.NumberFormat(intl.language.value === 'pt' ? 'pt-BR' : intl.language.value === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(Number(stripeAmount.value || 0))
  } catch {
    return String(stripeAmount.value)
  }
})

function loadStripeJs() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if ((window as any).Stripe) return resolve()

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar Stripe.js'))
    document.head.appendChild(script)
  })
}

async function ensureStripeElement() {
  if (!isIntl.value) return
  if (!product.value) return
  if (!customerEmail.value || !customerEmail.value.includes('@')) return

  intlError.value = ''

  const res: any = await $fetch('/api/stripe/payment-intent', {
    method: 'POST',
    body: {
      produtoId: product.value.id,
      email: customerEmail.value,
      nome: nome.value,
      whatsapp: whatsapp.value,
      currency: intlCurrency.value,
      countryCode: intlCountryCode.value || null
    }
  })

  stripeClientSecret.value = String(res.clientSecret || '') || null
  stripeOrderId.value = String(res.orderId || '') || null
  stripeAmount.value = res.amount == null ? null : Number(res.amount)
  stripeCurrency.value = String(res.currency || intlCurrency.value).toLowerCase() as any

  const publishableKey = String(res.publishableKey || '')
  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY não configurado')
  }

  if (!stripeClientSecret.value) {
    throw new Error('Falha ao inicializar pagamento')
  }

  await loadStripeJs()

  stripeInstance = (window as any).Stripe(publishableKey)
  stripeElements = stripeInstance.elements({ clientSecret: stripeClientSecret.value })

  const el = document.getElementById('stripe-payment-element')
  if (!el) return

  el.innerHTML = ''
  stripePaymentElement = stripeElements.create('payment')
  stripePaymentElement.mount('#stripe-payment-element')
}

watch([isIntl, intlCurrency, intlCountryCode, customerEmail], async () => {
  if (!isIntl.value) return
  if (stripeLoading.value) return

  try {
    await nextTick()
    await ensureStripeElement()
  } catch (err: any) {
    intlError.value = err?.data?.statusMessage || err?.message || 'Falha ao iniciar pagamento'
  }
})

async function payWithStripe() {
  if (!isIntl.value) return
  if (!product.value) return

  stripeLoading.value = true
  intlError.value = ''

  try {
    if (!acceptedTerms.value) {
      intlError.value = tIntl('Você precisa aceitar os termos para continuar.', 'You must accept the terms to continue.', 'Debes aceptar los términos para continuar.')
      return
    }

    if (!stripeInstance || !stripeElements) {
      await ensureStripeElement()
    }

    if (!stripeInstance || !stripeElements) {
      throw new Error('Stripe não inicializado')
    }

    const orderId = String(stripeOrderId.value || '').trim()
    const returnUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/obrigado?orderId=${encodeURIComponent(orderId)}`
      : ''

    const result = await stripeInstance.confirmPayment({
      elements: stripeElements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required'
    })

    if (result?.error) {
      throw new Error(String(result.error.message || 'Pagamento não autorizado'))
    }

    const status = String(result?.paymentIntent?.status || '').toLowerCase()
    if (status === 'succeeded' && orderId) {
      navigateTo({ path: '/obrigado', query: { orderId } })
    }
  } catch (err: any) {
    intlError.value = err?.data?.statusMessage || err?.message || 'Falha ao processar pagamento'
  } finally {
    stripeLoading.value = false
  }
}

const subtotal = computed(() => Number(product.value?.price || 0))
const formattedSubtotal = computed(() => {
  return subtotal.value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const formattedInstallment12 = computed(() => {
  if (!subtotal.value) {
    return Number(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  const v = Math.round((subtotal.value / 12) * 100) / 100
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

const productName = computed(() => {
  return String((product.value as any)?.nome || (product.value as any)?.name || '')
})

const productImage = computed(() => {
  const p: any = product.value
  const image = String(p?.imagem || p?.image || '').trim()
  if (!image) return '/products/placeholder.svg'
  if (image.startsWith('http://')) return image.replace(/^http:\/\//, 'https://')
  return image
})

function onProductImageError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.src.endsWith('/products/placeholder.svg')) return
  el.src = '/products/placeholder.svg'
}
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
let mpCardSubmitResolver: ((data: any) => void) | null = null

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
        },
        onSubmit: (event: any) => {
          try {
            event?.preventDefault?.()
          } catch {
            // ignore
          }

          const data = mpCardForm?.getCardFormData?.()
          if (mpCardSubmitResolver) {
            const resolve = mpCardSubmitResolver
            mpCardSubmitResolver = null
            resolve(data)
          }
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

    const cardData = await new Promise<any>((resolve, reject) => {
      mpCardSubmitResolver = resolve
      try {
        mpCardForm.submit()
      } catch (e) {
        mpCardSubmitResolver = null
        reject(e)
        return
      }

      setTimeout(() => {
        if (mpCardSubmitResolver) {
          mpCardSubmitResolver = null
          reject(new Error('Não foi possível validar o cartão. Tente novamente.'))
        }
      }, 10000)
    })

    if (!cardData?.token) {
      throw new Error('Token do cartão não foi gerado. Verifique os dados do cartão e tente novamente.')
    }

    if (!cardData?.paymentMethodId) {
      throw new Error('Selecione a bandeira do cartão e tente novamente.')
    }

    const res: any = await $fetch('/api/mercadopago/card', {
      method: 'POST',
      body: {
        produtoId: product.value.id,
        email: customerEmail.value,
        couponCode: appliedCoupon.value?.code || null,
        ...attributionPayload.value,
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
        couponCode: appliedCoupon.value?.code || null,
        ...attributionPayload.value
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

async function copyPixCode() {
  pixCopyError.value = ''
  pixCopied.value = false
  const text = String(pix.qrCode || '').trim()
  if (!text) return

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      pixCopied.value = true
      setTimeout(() => {
        pixCopied.value = false
      }, 2500)
      return
    }

    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', 'true')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    if (!ok) throw new Error('copy-failed')

    pixCopied.value = true
    setTimeout(() => {
      pixCopied.value = false
    }, 2500)
  } catch {
    pixCopyError.value = 'Não foi possível copiar. Selecione o código e copie manualmente.'
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
