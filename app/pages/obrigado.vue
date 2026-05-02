<script setup lang="ts">
import { trackPurchase, trackGoogleAdsConversion } from '~/composables/useTracking'
import { useEcommerceTracking } from '~/composables/useEcommerceTracking'
import type { PurchasePayload } from '~/composables/useEcommerceTracking'

const route = useRoute()
const config = useRuntimeConfig()

const { siteName } = useSiteBranding()
const baseUrl = useSiteUrl()
const intl = useIntlContext()

const productsIndexPath = computed(() => (intl.language.value === 'en' ? '/products' : '/produtos'))

useSeoMeta({
  title: `Obrigado | ${siteName}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/obrigado` }] : []
}))

const { data: siteSettings } = await useFetch('/api/site-settings')

const affiliateEnabled = computed(() => Boolean((config.public as any)?.affiliateEnabled))

const orderId = computed(() => String(route.query.orderId || ''))
const paymentId = computed(() => String(route.query.paymentId || ''))
const upsellParam = computed(() => String(route.query.upsell || ''))

const { trackMeta, trackGtag } = useTracking()
const { trackPurchase: ecomPurchase } = useEcommerceTracking()

const funnelOrder = ref<Record<string, any> | null>(null)

function loadFunnelOrder() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('funnelOrder')
    if (raw) funnelOrder.value = JSON.parse(raw)
  } catch {}
}

function fireFunnelPurchaseTracking() {
  if (!import.meta.client) return
  const order = funnelOrder.value
  if (!order?.orderId) return

  const purchaseKey = `funnel_purchase_${order.orderId}`
  try {
    if (localStorage.getItem(purchaseKey)) return
    localStorage.setItem(purchaseKey, '1')
  } catch {}

  const total = Number(order.totalFinal ?? order.total ?? 0)
  const transactionId = String(order.orderId)
  const produto = String(order.produto ?? 'Office 365 Pro')

  trackMeta('Purchase', { value: total, currency: 'BRL', content_name: produto })
  trackGtag('purchase', {
    value: total,
    currency: 'BRL',
    transaction_id: transactionId,
    items: [{ item_name: produto, price: Number(order.preco ?? 49), quantity: 1 }]
  })

  try {
    localStorage.setItem('funnelOrderLastCompleted', JSON.stringify(order))
    localStorage.removeItem('funnelOrder')
  } catch {}
}

onMounted(async () => {
  loadFunnelOrder()
  fireFunnelPurchaseTracking()

  // Check for upsell opportunity first
  const oid = String(orderId.value || '').trim()
  const hasUpsell = String(route.query.upsell || '') !== '1'
  
  if (oid && hasUpsell) {
    try {
      const upsellCheck: any = await $fetch('/api/upsell/check', {
        query: { orderId: oid }
      })
      
      if (upsellCheck.hasUpsell && upsellCheck.upsellProductId) {
        navigateTo({
          path: '/upsell',
          query: {
            orderId: oid,
            productId: upsellCheck.upsellProductId,
            cardToken: upsellCheck.cardToken || '',
            sc: upsellCheck.stripeCustomerId || '',
            pm: upsellCheck.stripePaymentMethodId || ''
          }
        })
        return
      }
    } catch {
      // If upsell check fails, continue with normal thank you page
    }
  }

  // Google Ads conversion tracking usando o novo sistema dinâmico
  let conversionValue: number | null | undefined = undefined
  let conversionCurrency: string | null | undefined = undefined

  try {
    if (orderId.value) {
      const res: any = await $fetch('/api/order-conversion', {
        query: { orderId: orderId.value }
      })
      const c = res?.conversion

      conversionValue = c?.value
      conversionCurrency = c?.currency
    }
  } catch {
    // se falhar, segue sem valor
  }

  const adsPayload: any = {
    transaction_id: orderId.value || undefined
  }

  if (conversionValue !== null && conversionValue !== undefined) {
    adsPayload.value = Number(conversionValue)
  }

  if (conversionCurrency) {
    adsPayload.currency = String(conversionCurrency)
  }

  await trackGoogleAdsConversion(adsPayload)

  // ── GA4 purchase tracking com dados reais do pedido ──
  try {
    if (!oid) return

    const purchaseKey = `purchase_tracked_${oid}`
    try {
      if (typeof window !== 'undefined' && window.localStorage?.getItem(purchaseKey)) {
        console.log('[GA4] purchase já rastreado para orderId:', oid)
        return
      }
    } catch {
      // ignore
    }

    const res: any = await $fetch(`/api/pedido/${encodeURIComponent(oid)}`)
    const order = res?.order
    const status = String(order?.status || '').toUpperCase()

    if (status === 'PAID') {
      // Detectar gateway a partir da resposta do backend
      const gateway: 'mercado_pago' | 'stripe' = order.gateway === 'stripe' ? 'stripe' : 'mercado_pago'
      const currency: 'BRL' | 'USD' = String(order.currency || '').toUpperCase() === 'USD' ? 'USD' : 'BRL'
      const total = Number(order.total || 0)
      const items = Array.isArray(order.items) ? order.items : []

      // Disparar usando useTracking (compatibilidade com Meta Pixel etc)
      trackPurchase(order)

      // Disparar usando useEcommerceTracking (GA4 ecommerce completo com dedup)
      ecomPurchase({
        transaction_id: oid,
        value: total,
        currency,
        gateway,
        items: items.map((item: any) => ({
          item_id: item.item_id || item.id,
          item_name: item.item_name || item.name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          item_category: item.item_category || 'Software'
        }))
      })

      // Meta Pixel purchase
      trackMeta('Purchase', { value: total, currency, content_name: items[0]?.item_name || '' })

      try {
        if (typeof window !== 'undefined') window.localStorage?.setItem(purchaseKey, '1')
      } catch {
        // ignore
      }

      try {
        const productSlug = items[0]?.item_id || items[0]?.item_name || ''
        await $fetch('/api/abandoned-checkout/recover', {
          method: 'POST',
          body: {
            orderId: oid,
            email: order.email || '',
            phone: order.phone || order.telefone || '',
            product: productSlug
          }
        })
      } catch {
        // não bloquear fluxo
      }
    }
  } catch (err) {
    console.error('[GA4] Erro ao rastrear purchase:', err)
  }
})
</script>

<template>
  <section class="bg-gray-50 min-h-screen py-16">
    <div class="max-w-3xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <!-- Upsell accepted banner -->
        <div v-if="upsellParam === 'accepted'" class="mb-4 flex items-center gap-2 text-blue-700 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-sm font-semibold">
          <span>🎁</span>
          Windows 11 Pro adicionado ao seu pedido!
        </div>

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
          <NuxtLink :to="productsIndexPath" class="bg-white hover:bg-gray-50 text-gray-900 px-5 py-3 rounded-xl font-semibold border border-gray-200">
            Ver produtos
          </NuxtLink>
        </div>

        <div
          v-if="affiliateEnabled"
          class="mt-10 bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <div class="text-xl font-extrabold text-gray-900">Indique este produto para amigos e ganhe comissão por cada venda.</div>
            <div class="mt-2 text-gray-700">Torne-se afiliado.</div>
          </div>
          <NuxtLink
            to="/partner-apply"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Quero me inscrever
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
