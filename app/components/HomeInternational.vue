<template>
  <div class="min-h-screen bg-white">

    <!-- HERO -->
    <section class="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      </div>
      <div class="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-blue-300 mb-6">
            <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Genuine Software Licenses — Instant Delivery
          </div>
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Original Software Licenses<br />
            <span class="text-blue-400">at the Best Price</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl">
            Windows, Office, and more — 100% genuine licenses delivered instantly to your email.
            Secure checkout with Stripe. Trusted by thousands of customers worldwide.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="#products"
              class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition"
            >
              View Licenses
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a
              href="#how-it-works"
              class="inline-flex items-center justify-center gap-2 border border-slate-500 hover:border-blue-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              How It Works
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST BADGES -->
    <section class="bg-slate-50 border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="badge in trustBadges" :key="badge.title" class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
              {{ badge.icon }}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ badge.title }}</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ badge.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section id="products" class="max-w-7xl mx-auto px-6 py-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Featured Licenses</h2>
          <p class="text-slate-500 mt-1 text-sm">Best-selling software licenses, ready for instant activation.</p>
        </div>
        <NuxtLink to="/products" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition hidden sm:block">
          View all →
        </NuxtLink>
      </div>

      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 4" :key="n" class="bg-slate-100 rounded-2xl h-64 animate-pulse" />
      </div>

      <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in products.slice(0, 8)"
          :key="product.id"
          class="group bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
          @click="goToProduct(product)"
        >
          <div class="bg-slate-50 p-6 flex items-center justify-center h-40">
            <img
              :src="product.image || '/products/placeholder.svg'"
              :alt="product.name || product.nome"
              class="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>
          <div class="p-4">
            <h3 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-2">
              {{ product.name || product.nome }}
            </h3>
            <div class="flex items-center justify-between mt-3">
              <div>
                <span v-if="product.usdPrice" class="text-lg font-extrabold text-blue-600">
                  ${{ formatPrice(product.usdPrice) }}
                </span>
                <span v-else class="text-sm text-slate-400 italic">Coming soon</span>
              </div>
              <button class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-slate-400">
        <div class="text-4xl mb-3">📦</div>
        <p>Products coming soon. Check back shortly.</p>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="bg-slate-50 py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">How It Works</h2>
          <p class="text-slate-500 mt-2">Three simple steps to activate your license.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="text-center">
            <div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 shadow-lg">
              {{ i + 1 }}
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-2">{{ step.title }}</h3>
            <p class="text-slate-500 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BENEFITS -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Why Choose Us</h2>
        <p class="text-slate-500 mt-2">Trusted by customers in over 50 countries.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="benefit in benefits"
          :key="benefit.title"
          class="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition"
        >
          <div class="text-3xl mb-3">{{ benefit.icon }}</div>
          <h3 class="font-bold text-slate-900 mb-2">{{ benefit.title }}</h3>
          <p class="text-sm text-slate-500">{{ benefit.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="bg-slate-50 py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Browse by Category</h2>
          <p class="text-slate-500 mt-2">Find the right license for your needs.</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/products?category=${cat.slug}`"
            class="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 text-center hover:shadow-sm transition group"
          >
            <div class="text-3xl mb-2">{{ cat.icon }}</div>
            <div class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{{ cat.name }}</div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="max-w-4xl mx-auto px-6 py-16">
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
      </div>
      <div class="space-y-3">
        <div
          v-for="(item, i) in faq"
          :key="i"
          class="border border-slate-200 rounded-2xl overflow-hidden"
        >
          <button
            class="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-slate-50 transition"
            @click="toggleFaq(i)"
          >
            {{ item.q }}
            <svg
              class="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform"
              :class="openFaq === i ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="openFaq === i" class="px-6 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
            {{ item.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BOTTOM -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Ready to get your license?</h2>
        <p class="text-blue-100 text-lg mb-8">Instant delivery. Secure payment. Genuine software.</p>
        <a
          href="#products"
          class="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-blue-50 transition"
        >
          Browse Licenses
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const openFaq = ref<number | null>(null)

function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

function formatPrice(n: number) {
  return Number(n).toFixed(2)
}


const trustBadges = [
  { icon: '⚡', title: 'Instant Delivery', desc: 'License key sent to your email in minutes.' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Stripe — no card data stored.' },
  { icon: '✅', title: 'Genuine Licenses', desc: '100% original, direct from official sources.' },
  { icon: '🌍', title: 'Global Support', desc: 'Customer support available worldwide.' },
]

const steps = [
  { title: 'Choose Your License', desc: 'Browse our catalog and select the software you need.' },
  { title: 'Pay Securely with Stripe', desc: 'Complete checkout with credit/debit card via Stripe. USD and EUR accepted.' },
  { title: 'Receive Your Key by Email', desc: 'Your license key is delivered instantly to your inbox. Activate and enjoy.' },
]

const benefits = [
  { icon: '📧', title: 'Email Delivery', desc: 'Your license key arrives directly in your inbox, no waiting, no shipping.' },
  { icon: '💳', title: 'Stripe Payments', desc: 'Pay safely with any major credit or debit card. USD and EUR supported.' },
  { icon: '🛡️', title: '100% Genuine', desc: 'All licenses are fully authentic and come with official activation support.' },
  { icon: '🔑', title: 'Easy Activation', desc: 'Simple step-by-step instructions included with every license key.' },
  { icon: '🤝', title: 'Customer Support', desc: 'Our team is ready to help you with activation and any questions.' },
  { icon: '🧾', title: 'Invoice Available', desc: 'Need a receipt? An invoice can be provided upon request.' },
]

const categories = [
  { icon: '🪟', name: 'Windows', slug: 'windows' },
  { icon: '📊', name: 'Microsoft Office', slug: 'office' },
  { icon: '🛡️', name: 'Antivirus', slug: 'antivirus' },
  { icon: '⚙️', name: 'Other Software', slug: 'other' },
]

const faq = [
  {
    q: 'Are the licenses genuine?',
    a: 'Yes. All licenses we sell are 100% authentic and sourced from official channels. They are fully activatable and valid for lifetime use.'
  },
  {
    q: 'How quickly will I receive my license?',
    a: 'License keys are delivered to your email within minutes of payment confirmation. In most cases, delivery is instant.'
  },
  {
    q: 'What currencies are accepted?',
    a: 'We accept USD (US Dollar) and EUR (Euro) via Stripe. Your bank may apply standard international conversion rates.'
  },
  {
    q: 'Can I get an invoice?',
    a: 'Yes. If you need an invoice for your purchase, please contact our support team after completing your order.'
  },
  {
    q: 'What if the license doesn\'t work?',
    a: 'We offer full support for activation issues. If a license key is invalid, we will replace it or issue a refund.'
  },
  {
    q: 'Is my payment information safe?',
    a: 'Absolutely. Payments are processed entirely by Stripe — we never store your card details. Stripe is PCI DSS Level 1 certified.'
  },
]

interface IntlProduct {
  id: string | number
  name?: string
  nome?: string
  slug: string
  image?: string | null
  usdPrice?: number | null
  eurPrice?: number | null
}

function goToProduct(product: IntlProduct) {
  navigateTo(`/product/${product.slug}`)
}

const { data: rawProducts, pending } = await useFetch<any>('/api/intl/products', {
  server: false,
  lazy: true,
  default: () => ({ ok: true, produtos: [] })
})

const products = computed<IntlProduct[]>(() => {
  const raw = rawProducts.value
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.produtos) ? raw.produtos : []
  return list
    .filter((p: any) => p.usdPrice != null && Number(p.usdPrice) > 0)
    .map((p: any) => ({
      id: p.id,
      name: p.name || p.nome,
      slug: p.slug,
      image: p.image || p.imagem,
      usdPrice: Number(p.usdPrice),
      eurPrice: p.eurPrice ? Number(p.eurPrice) : null,
    }))
})
</script>
