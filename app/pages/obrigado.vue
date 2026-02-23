<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
import { trackPurchase } from '~/services/analytics'

const { siteName } = useSiteBranding()
const baseUrl = useSiteUrl()

useSeoMeta({
  title: `Obrigado | ${siteName}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/obrigado` }] : []
}))

const { data: siteSettings } = await useFetch('/api/site-settings')

const orderId = computed(() => String(route.query.orderId || ''))
const paymentId = computed(() => String(route.query.paymentId || ''))

const googleAdsConversionId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAdsConversionId
  return String(fromDb || config.public.googleAdsConversionId || '')
})

const googleAdsConversionLabel = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAdsConversionLabel
  return String(fromDb || config.public.googleAdsConversionLabel || '')
})

onMounted(async () => {
  const id = googleAdsConversionId.value
  if (!id) return
  if (typeof window === 'undefined') return

  const gtag = (window as any).gtag
  if (typeof gtag !== 'function') return

  let label = googleAdsConversionLabel.value
  let value: number | null | undefined = undefined
  let currency: string | null | undefined = undefined

  try {
    if (orderId.value) {
      const res: any = await $fetch('/api/order-conversion', {
        query: { orderId: orderId.value }
      })
      const c = res?.conversion

      if (c?.label) label = String(c.label)
      value = c?.value
      currency = c?.currency
    }
  } catch {
    // se falhar, segue com label do runtimeConfig
  }

  if (!label) return

  const payload: any = {
    send_to: `${id}/${label}`,
    transaction_id: orderId.value || undefined
  }

  if (value !== null && value !== undefined) {
    payload.value = Number(value)
  }

  if (currency) {
    payload.currency = String(currency)
  }

  gtag('event', 'conversion', payload)

  try {
    const oid = String(orderId.value || '').trim()
    if (!oid) return

    const purchaseKey = `ga4_purchase_tracked_${oid}`
    try {
      if (typeof window !== 'undefined' && window.localStorage?.getItem(purchaseKey)) return
    } catch {
      // ignore
    }

    const res: any = await $fetch(`/api/pedido/${encodeURIComponent(oid)}`)
    const order = res?.order
    const status = String(order?.status || '').toUpperCase()

    if (status === 'PAID') {
      trackPurchase(order)

      try {
        if (typeof window !== 'undefined') window.localStorage?.setItem(purchaseKey, '1')
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
})
</script>

<template>
  <section class="bg-gray-50 min-h-screen py-16">
    <div class="max-w-3xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div class="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-sm font-semibold">
          <span>✔</span>
          Pagamento confirmado
        </div>

        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">Obrigado pela sua compra!</h1>
        <p class="mt-3 text-gray-700">
          Seu pagamento foi confirmado.
        </p>

        <div class="mt-6 space-y-2 text-sm text-gray-700">
          <div>
            Enviamos sua licença e instruções para o e-mail informado na compra.
          </div>
          <div>
            Se não encontrar, verifique também a caixa de spam.
          </div>
        </div>

        <div v-if="orderId || paymentId" class="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <div v-if="orderId" class="text-gray-700">
            <span class="font-semibold">Pedido:</span> {{ orderId }}
          </div>
          <div v-if="paymentId" class="text-gray-700 mt-1">
            <span class="font-semibold">Pagamento:</span> {{ paymentId }}
          </div>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <NuxtLink to="/" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold">
            Voltar para a Home
          </NuxtLink>
          <NuxtLink to="/produtos" class="bg-white hover:bg-gray-50 text-gray-900 px-5 py-3 rounded-xl font-semibold border border-gray-200">
            Ver produtos
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
