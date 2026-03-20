/**
 * useCheckout — composable para o fluxo de pagamento híbrido
 * Suporta PIX (Pagar.me), cartão BR (Pagar.me), cartão INT (Stripe)
 * com order bump e tracking automático
 */
import { ref, computed } from 'vue'

export type CheckoutMethod = 'pix' | 'credit_card' | 'stripe_card'

export interface CheckoutForm {
  produtoId: string
  email: string
  nome: string
  document?: string
  method: CheckoutMethod
  orderBump: boolean
  bumpProductId?: string
  installments?: number
  card?: {
    number: string
    holder_name: string
    exp_month: number
    exp_year: number
    cvv: string
  }
  currency?: string
}

export const useCheckout = () => {
  const loading    = ref(false)
  const error      = ref('')
  const orderId    = ref('')
  const pixQrCode  = ref('')
  const pixQrUrl   = ref('')
  const pixExpires = ref('')
  const stripeClientSecret = ref('')
  const stripePublishableKey = ref('')
  const cardToken  = ref('')   // Pagar.me card token para upsell

  const { getRef } = useAffiliate()

  async function trackPurchase(amount: number, currency: string) {
    if (!import.meta.client) return
    try {
      const w = window as any
      if (w.fbq) w.fbq('track', 'Purchase', { value: amount, currency: currency.toUpperCase() })
      if (w.gtag) w.gtag('event', 'purchase', { value: amount, currency: currency.toUpperCase(), transaction_id: orderId.value })
    } catch {}
  }

  async function trackInitiateCheckout(amount: number) {
    if (!import.meta.client) return
    try {
      const w = window as any
      if (w.fbq) w.fbq('track', 'InitiateCheckout', { value: amount, currency: 'BRL' })
      if (w.gtag) w.gtag('event', 'begin_checkout', { value: amount })
    } catch {}
  }

  async function saveAbandoned(email: string, produtoId: string) {
    if (!email.includes('@')) return
    try {
      await $fetch('/api/abandoned', {
        method: 'POST',
        body: { email, produtoId },
      })
    } catch {}
  }

  async function submit(form: CheckoutForm) {
    loading.value = true
    error.value   = ''

    await trackInitiateCheckout(0)

    try {
      const body = {
        ...form,
        affiliate: getRef(),
      }

      const result: any = await $fetch('/api/checkout', {
        method: 'POST',
        body,
      })

      orderId.value = result.orderId

      if (result.gateway === 'pagarme') {
        if (result.method === 'pix') {
          pixQrCode.value  = result.qrCode  || ''
          pixQrUrl.value   = result.qrCodeUrl || ''
          pixExpires.value = result.expiresAt || ''
        } else if (result.method === 'credit_card') {
          if (result.status === 'paid') {
            await trackPurchase(form.card ? 0 : 0, form.currency || 'BRL')
            await navigateTo({ path: '/obrigado', query: { orderId: orderId.value } })
          } else {
            error.value = 'Pagamento não aprovado. Verifique os dados do cartão.'
          }
        }
        if (result.cardToken) cardToken.value = result.cardToken
      }

      if (result.gateway === 'stripe') {
        stripeClientSecret.value   = result.clientSecret   || ''
        stripePublishableKey.value = result.publishableKey || ''
      }

      return result
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Erro ao processar pagamento'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function submitUpsell(opts: {
    parentOrderId: string
    upsellProductId: string
    cardToken?: string
    stripeCustomerId?: string
    stripePaymentMethodId?: string
  }) {
    loading.value = true
    error.value   = ''
    try {
      const result: any = await $fetch('/api/upsell', {
        method: 'POST',
        body: opts,
      })
      return result
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Erro no upsell'
      throw e
    } finally {
      loading.value = false
    }
  }

  const isPix    = computed(() => !!pixQrCode.value)
  const isStripe = computed(() => !!stripeClientSecret.value)

  return {
    loading, error, orderId,
    pixQrCode, pixQrUrl, pixExpires,
    stripeClientSecret, stripePublishableKey,
    cardToken, isPix, isStripe,
    submit, submitUpsell, saveAbandoned, trackPurchase,
  }
}
