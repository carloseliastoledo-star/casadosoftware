<template>
  <div class="py-10">
    <div v-if="!product" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
      Product not found.
    </div>

    <div v-else>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-gray-500">
          <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink :to="`/category/${product.categorySlug}`" class="hover:underline">Category</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-gray-700 font-semibold">{{ product.title }}</span>
        </div>
        <NuxtLink :to="`/category/${product.categorySlug}`" class="text-sm font-extrabold text-brand-blue hover:underline">
          Browse similar →
        </NuxtLink>
      </div>

      <section class="mt-6 grid gap-8 lg:grid-cols-2">
        <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <ProductMockup :variant="product.imageVariant" :image-url="product.imageUrl" />

          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ product.title }}</h1>
          <p class="mt-3 text-base text-gray-700">{{ product.shortDescription }}</p>

          <div class="mt-6 flex flex-wrap items-end gap-3">
            <div class="text-4xl font-extrabold text-gray-900">{{ price }}</div>
            <div v-if="compareAt" class="text-sm font-bold text-gray-400 line-through">{{ compareAt }}</div>
            <div v-if="discountPercent" class="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-green-700">
              {{ discountPercent }}% OFF
            </div>
          </div>

          <div class="mt-6 grid gap-2 text-sm font-semibold text-gray-700">
            <div v-for="b in benefits" :key="b" class="flex items-center gap-2">
              <span class="text-brand-green">✔</span>
              <span>{{ b }}</span>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-extrabold text-amber-800">
            <span>Limited time offer 🔥</span>
            <span v-if="stockLeftLabel">{{ stockLeftLabel }}</span>
          </div>

          <button
            type="button"
            class="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-brand-blue px-6 py-4 text-base font-extrabold text-white shadow-sm hover:bg-blue-700"
            @click="buyNow"
            :disabled="loading"
          >
            <span v-if="loading">Redirecting...</span>
            <span v-else>Buy Now</span>
          </button>

          <div class="mt-4 grid gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm font-extrabold text-gray-900">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-amber-500">★★★★★</span>
              <span>{{ ratingLabel }}</span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-700">Trusted by 50,000+ customers worldwide</span>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-700">
              <div class="flex items-center gap-2"><span class="text-brand-green">✔</span> 30-Day Money Back Guarantee</div>
              <div class="flex items-center gap-2"><span class="text-brand-green">✔</span> Instant Replacement if Key Fails</div>
            </div>
            <div class="text-xs font-semibold text-gray-600">
              Secure payment via Stripe Checkout.
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 class="text-xl font-extrabold text-gray-900">What you get</h2>
          <div class="mt-4 grid gap-3 text-sm text-gray-700">
            <div class="rounded-2xl bg-gray-50 p-4">
              <div class="font-extrabold">Instant Email Delivery</div>
              <div class="mt-1 text-gray-600">License + instructions delivered after payment confirmation.</div>
            </div>
            <div class="rounded-2xl bg-gray-50 p-4">
              <div class="font-extrabold">Clear Activation Guide</div>
              <div class="mt-1 text-gray-600">Easy steps to activate. Works worldwide.</div>
            </div>
            <div class="rounded-2xl bg-gray-50 p-4">
              <div class="font-extrabold">Secure Payment</div>
              <div class="mt-1 text-gray-600">Stripe Checkout provides a smooth and secure payment experience.</div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">Product details</h2>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <div class="rounded-2xl bg-gray-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">What is this product?</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-700">{{ product.description.whatIs }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">How delivery works</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-700">{{ product.description.delivery }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">Activation guide</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-700">{{ product.description.activation }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">System requirements</div>
            <p class="mt-2 text-sm leading-relaxed text-gray-700">{{ product.description.requirements }}</p>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <div class="flex items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">FAQ</h2>
            <p class="mt-2 text-sm text-gray-600">Everything you need to know before purchase.</p>
          </div>
        </div>
        <div class="mt-6">
          <FaqAccordion :items="product.faqs" />
        </div>
      </section>

      <section class="mt-10">
        <div class="flex items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">Related products</h2>
            <p class="mt-2 text-sm text-gray-600">Customers also like these.</p>
          </div>
        </div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard v-for="p in related" :key="p.slug" :product="p" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import FaqAccordion from '~/components/FaqAccordion.vue'
import ProductMockup from '~/components/ProductMockup.vue'
import { products, formatUsd, type Product } from '~/data/catalog'
import { useSite } from '~/composables/useSite'

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())

const { data: productData } = await useFetch<Product>(() => `/api/products/${slug.value}`)
const product = computed(() => productData.value || null)

const price = computed(() => (product.value ? formatUsd(product.value.priceUsdCents) : ''))
const compareAt = computed(() => (product.value?.compareAtUsdCents ? formatUsd(product.value.compareAtUsdCents) : ''))
const discountPercent = computed(() => {
  if (!product.value?.compareAtUsdCents) return 0
  const p = product.value.priceUsdCents
  const c = product.value.compareAtUsdCents
  if (c <= 0 || p >= c) return 0
  return Math.round(((c - p) / c) * 100)
})

const benefits = computed(() => product.value?.benefits || ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'])

const stockLeftLabel = computed(() => {
  const left = Number(product.value?.stockLeft ?? 0)
  if (!left || left < 0) return ''
  return `Only ${left} licenses left`
})

const ratingLabel = computed(() => {
  const rating = Number(product.value?.rating ?? 4.8)
  const reviews = Number(product.value?.reviewCount ?? 12483)
  return `${rating.toFixed(1)}/5 (${reviews.toLocaleString('en-US')} reviews)`
})

const related = computed<Product[]>(() => {
  const rel = product.value?.relatedSlugs || []
  return rel.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[]
})

const { siteName, absoluteUrl } = useSite()

useSeoMeta(() => {
  const p = product.value
  if (!p) return { title: 'Product', description: 'Software license product page.' }
  return {
    title: p.title,
    description: p.shortDescription
  }
})

useHead(() => {
  const p = product.value
  if (!p) return {}

  const canonical = absoluteUrl(`/product/${p.slug}`)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.shortDescription,
    brand: { '@type': 'Brand', name: siteName },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (p.priceUsdCents / 100).toFixed(2),
      url: canonical || undefined,
      availability: 'https://schema.org/InStock'
    }
  }

  return {
    link: canonical ? [{ rel: 'canonical', href: canonical }] : [],
    script: [{ type: 'application/ld+json', children: JSON.stringify(jsonLd) }]
  }
})

const loading = ref(false)

async function buyNow() {
  if (!product.value) return
  loading.value = true
  try {
    const res = await $fetch<{ url: string }>('/api/checkout', {
      method: 'POST',
      body: { slug: product.value.slug }
    })
    if (res?.url) {
      window.location.href = res.url
      return
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.text-brand-blue { color: #1D4ED8; }
.text-brand-green { color: #16A34A; }
</style>
