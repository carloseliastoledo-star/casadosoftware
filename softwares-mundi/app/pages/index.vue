<template>
  <div>
    <section class="pt-10 sm:pt-14">
      <div class="grid gap-10 rounded-3xl border border-gray-100 bg-gradient-to-b from-blue-50 to-white p-8 shadow-sm md:grid-cols-2 md:items-center">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Save up to 70% on Genuine Software Licenses
          </h1>
          <p class="mt-3 text-lg font-semibold text-gray-700">
            Instant Delivery • Lifetime Activation • Secure Checkout
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="#featured"
              class="inline-flex items-center justify-center rounded-2xl bg-brand-blue px-6 py-3 text-base font-extrabold text-white shadow-sm hover:bg-blue-700"
            >
              Get Your License Now
            </a>
            <NuxtLink
              to="/faq"
              class="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-base font-extrabold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              See FAQ
            </NuxtLink>
          </div>

          <div class="mt-4 grid gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm font-extrabold text-gray-900">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-amber-500">★★★★★</span>
              <span>4.8/5 (12,483 reviews)</span>
              <span class="text-gray-300">•</span>
              <span class="text-gray-700">Trusted by 50,000+ customers worldwide</span>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-700">
              <div class="flex items-center gap-2"><span class="text-brand-green">✔</span> 30-Day Money Back Guarantee</div>
              <div class="flex items-center gap-2"><span class="text-brand-green">✔</span> Instant Replacement if Key Fails</div>
            </div>
          </div>

          <div class="mt-6 grid gap-3 text-sm font-semibold text-gray-700 sm:grid-cols-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
              Instant Email Delivery
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
              Genuine License
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
              Works Worldwide
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
              Secure Payment
            </div>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="text-sm font-bold text-gray-700">Trusted checkout</div>
            <div class="mt-2 text-2xl font-extrabold text-gray-900">Pay securely with Stripe</div>
            <div class="mt-2 text-sm text-gray-600">
              Your payment is processed securely. We never store card details.
            </div>
          </div>

          <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="text-sm font-bold text-gray-700">Risk-Free Purchase</div>
            <div class="mt-2 text-2xl font-extrabold text-gray-900">30-Day Money Back Guarantee</div>
            <div class="mt-2 text-sm text-gray-600">
              Not satisfied? Request a refund within 30 days. Plus: instant replacement if a key fails.
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="featured" class="pt-14">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <p class="mt-2 text-sm text-gray-600">Handpicked best-sellers for international buyers.</p>
        </div>
        <NuxtLink to="/category/microsoft" class="text-sm font-extrabold text-brand-blue hover:underline">
          Browse Microsoft →
        </NuxtLink>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="p in featured" :key="p.slug" :product="p" />
      </div>
    </section>

    <section class="pt-14">
      <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">Why customers choose us</h2>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl bg-blue-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">Instant Delivery</div>
            <p class="mt-2 text-sm text-gray-700">Receive your license and instructions by email after payment confirmation.</p>
          </div>
          <div class="rounded-2xl bg-green-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">Genuine License</div>
            <p class="mt-2 text-sm text-gray-700">We focus on genuine software licenses and clear activation guidance.</p>
          </div>
          <div class="rounded-2xl bg-gray-50 p-6">
            <div class="text-lg font-extrabold text-gray-900">Secure Payment</div>
            <p class="mt-2 text-sm text-gray-700">Stripe Checkout provides a smooth, secure purchase experience.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-14">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight text-gray-900">FAQ</h2>
          <p class="mt-2 text-sm text-gray-600">Quick answers before you buy.</p>
        </div>
        <NuxtLink to="/faq" class="text-sm font-extrabold text-brand-blue hover:underline">View all →</NuxtLink>
      </div>
      <div class="mt-6">
        <FaqAccordion :items="faqPreview" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import FaqAccordion from '~/components/FaqAccordion.vue'
import type { Product } from '~/data/catalog'
import { useSite } from '~/composables/useSite'
import { useCatalog } from '~/composables/useCatalog'

const { siteName } = useSite()

useSeoMeta({
  title: 'Original Software Licenses',
  description: 'Buy genuine software licenses with instant email delivery, lifetime activation, and secure payment.'
})

const featured = computed<Product[]>(() => {
  const pick = [
    'microsoft-office-365-lifetime',
    'microsoft-office-2024-professional-plus',
    'windows-11-pro-key',
    'adobe-photoshop-2024',
    'kaspersky-total-security',
    'winrar-license'
  ]
  return pick.map((s) => catalog.products.value.find((p) => p.slug === s)).filter(Boolean) as Product[]
})

const catalog = useCatalog()

const faqPreview = [
  { q: 'How do I receive my license?', a: 'After checkout, you will receive your license and instructions by email.' },
  { q: 'Is payment secure?', a: 'Yes. We use Stripe Checkout for secure payment processing.' },
  { q: 'Do you offer refunds?', a: 'Please see our Refund Policy page for details and eligibility.' }
]
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.text-brand-blue { color: #1D4ED8; }
.bg-brand-green { background-color: #16A34A; }
</style>
