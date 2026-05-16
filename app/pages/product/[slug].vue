<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 py-10">

      <!-- Back -->
      <div class="mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition">
          ← Back to store
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
        <div class="bg-slate-200 rounded-2xl h-80" />
        <div class="space-y-4 pt-2">
          <div class="h-7 bg-slate-200 rounded w-3/4" />
          <div class="h-4 bg-slate-200 rounded w-full" />
          <div class="h-4 bg-slate-200 rounded w-5/6" />
          <div class="h-10 bg-slate-200 rounded w-1/3 mt-6" />
          <div class="h-14 bg-slate-200 rounded mt-2" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-24">
        <div class="text-6xl mb-4">⚠️</div>
        <p class="text-slate-600 text-lg">{{ error }}</p>
        <NuxtLink to="/" class="mt-6 inline-block text-blue-600 hover:underline text-sm font-semibold">← Return to store</NuxtLink>
      </div>

      <!-- Product detail -->
      <div v-else-if="product">

        <!-- Top section: image + main info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

          <!-- Image -->
          <div class="bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-10 min-h-72">
            <img
              v-if="product.imagem"
              :src="product.imagem"
              :alt="product.nome"
              class="max-h-72 max-w-full object-contain drop-shadow-sm"
            />
            <div v-else class="text-8xl">📦</div>
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-5">

            <div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">{{ product.nome }}</h1>
              <p class="text-slate-500 text-sm mt-2">Digital license · Instant email delivery</p>
            </div>

            <!-- Price -->
            <div class="flex items-end gap-3">
              <span v-if="product.oldUsdPrice" class="text-slate-400 line-through text-xl">
                ${{ fmt(product.oldUsdPrice) }}
              </span>
              <span class="text-4xl font-extrabold text-blue-600">
                ${{ fmt(product.usdPrice) }} <span class="text-lg font-bold text-slate-400">USD</span>
              </span>
            </div>

            <!-- Benefits -->
            <ul class="space-y-2">
              <li v-for="b in benefits" :key="b" class="flex items-center gap-2.5 text-sm text-slate-700">
                <span class="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">✓</span>
                {{ b }}
              </li>
            </ul>

            <!-- Buy Now button -->
            <button
              @click="buyNow"
              class="mt-2 w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition flex items-center justify-center gap-2"
            >
              🔒 Buy Now — ${{ fmt(product.usdPrice) }} USD
            </button>

            <p class="text-xs text-slate-400 text-center">Secure checkout · Powered by Stripe · 30-day support</p>

            <!-- What's included -->
            <div v-if="product.cardItems?.length" class="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What's included</p>
              <ul class="space-y-1">
                <li v-for="item in product.cardItems" :key="item" class="flex items-center gap-2 text-sm text-slate-700">
                  <span class="text-blue-500 font-bold">·</span> {{ item }}
                </li>
              </ul>
            </div>

          </div>
        </div>

        <!-- Description -->
        <div v-if="product.descricao" class="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 class="text-lg font-extrabold text-slate-900 mb-3">About this license</h2>
          <p class="text-slate-600 text-sm leading-relaxed">{{ product.descricao }}</p>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 class="text-lg font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-4">
            <div v-for="faq in faqs" :key="faq.q" class="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <p class="font-semibold text-slate-800 text-sm mb-1">{{ faq.q }}</p>
              <p class="text-slate-500 text-sm leading-relaxed">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 class="text-xl font-extrabold mb-2">Ready to activate your license?</h3>
          <p class="text-blue-200 text-sm mb-5">Instant delivery to your email. No waiting, no shipping.</p>
          <button
            @click="buyNow"
            class="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-3 rounded-xl text-base shadow transition"
          >
            Buy Now — ${{ fmt(product.usdPrice) }} USD
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'default' })

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())

interface IntlProduct {
  id: string
  nome: string
  slug: string
  imagem: string | null
  descricao: string | null
  usdPrice: number
  oldUsdPrice: number | null
  cardItems: string[]
}

const product = ref<IntlProduct | null>(null)
const loading = ref(true)
const error = ref('')

const benefits = [
  'Instant email delivery',
  'Genuine license key',
  'Secure payment by Stripe',
  'Customer support included',
]

const faqs = [
  { q: 'How do I receive my license?', a: 'After payment, your license key is delivered instantly to your email address. Check your spam folder if it doesn\'t arrive within 5 minutes.' },
  { q: 'Is this a genuine license?', a: 'Yes. All licenses are 100% genuine, sourced directly from official channels. They are permanent and not subject to revocation.' },
  { q: 'What currencies are accepted?', a: 'We accept USD and EUR via Stripe. Your bank may apply standard international conversion rates.' },
  { q: 'What if my license doesn\'t work?', a: 'Contact our support team and we will replace the license key or issue a full refund — no questions asked.' },
]

function fmt(v: number | null | undefined) {
  return Number(v || 0).toFixed(2)
}

function buyNow() {
  navigateTo({ path: '/checkout-intl', query: { product: slug.value } })
}

async function loadProduct() {
  loading.value = true
  error.value = ''
  try {
    const data: any = await $fetch('/api/intl/products')
    const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.produtos) ? data.produtos : []
    const found = list.find((p: any) => p.slug === slug.value)

    if (!found) {
      error.value = 'Product not found or not available in your region.'
      return
    }

    const rawDesc = String(found.descricao || found.description || '')
      .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    product.value = {
      id: String(found.id || ''),
      nome: String(found.name || found.nome || ''),
      slug: String(found.slug || slug.value),
      imagem: found.image || found.imagem || null,
      descricao: rawDesc || null,
      usdPrice: Number(found.usdPrice || 0),
      oldUsdPrice: found.oldUsdPrice ? Number(found.oldUsdPrice) : null,
      cardItems: Array.isArray(found.cardItems) ? found.cardItems : [],
    }

    useSeoMeta({
      title: `${product.value.nome} — Buy Online`,
      description: `Buy ${product.value.nome} — instant digital delivery, genuine license, secured by Stripe.`,
    })
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to load product.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>
