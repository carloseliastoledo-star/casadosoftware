<template>
  <section class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 pt-12 pb-10">
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100">
            <span class="text-blue-600">⚡</span>
            {{ $t('home.badge_instant_email') }}
          </div>

          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            {{ $t('home.hero_title') }}
          </h1>

          <p class="text-gray-600 text-lg leading-relaxed">
            {{ $t('home.hero_description') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/produtos"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              {{ $t('home.view_products') }}
            </NuxtLink>

            <NuxtLink
              to="/tutoriais"
              class="border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              {{ $t('view_tutorials') }}
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm text-gray-700 pt-2">
            <div class="bg-white border rounded-lg p-3">🔒 {{ $t('home.trust_secure_purchase') }}</div>
            <div class="bg-white border rounded-lg p-3">💳 {{ $t('home.trust_online_payment') }}</div>
            <div class="bg-white border rounded-lg p-3">⚡ {{ $t('home.trust_instant_delivery') }}</div>
            <div class="bg-white border rounded-lg p-3">💬 {{ $t('home.trust_fast_support') }}</div>
          </div>
        </div>

        <div class="relative">
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-lg">
            <div class="text-sm font-semibold text-blue-100">{{ $t('home.featured_badge') }}</div>
            <div class="mt-2 text-2xl font-extrabold">{{ $t('home.featured_title') }}</div>
            <p class="mt-3 text-blue-100">
              {{ $t('home.featured_description') }}
            </p>
            <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div class="bg-white/10 rounded-xl p-4">
                <div class="font-bold">Windows</div>
                <div class="text-blue-100 mt-1">10/11 Pro</div>
              </div>
              <div class="bg-white/10 rounded-xl p-4">
                <div class="font-bold">Office</div>
                <div class="text-blue-100 mt-1">2021 / 365</div>
              </div>
            </div>
            <div class="mt-6">
              <NuxtLink
                to="/produtos"
                class="inline-flex items-center justify-center w-full bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
              >
                {{ $t('home.start_now') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border-y">
      <div class="max-w-7xl mx-auto px-6 py-10">
        <h2 class="text-2xl font-extrabold text-gray-900 text-center">{{ $t('home.why_title') }}</h2>
        <p class="text-gray-600 text-center mt-2">
          {{ $t('home.why_subtitle') }}
        </p>

        <div class="mt-8 grid md:grid-cols-4 gap-5">
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">✅</div>
            <div class="font-bold mt-3">{{ $t('home.why_card1_title') }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ $t('home.why_card1_body') }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">⚡</div>
            <div class="font-bold mt-3">{{ $t('home.why_card2_title') }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ $t('home.why_card2_body') }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">📘</div>
            <div class="font-bold mt-3">{{ $t('home.why_card3_title') }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ $t('home.why_card3_body') }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">💬</div>
            <div class="font-bold mt-3">{{ $t('home.why_card4_title') }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ $t('home.why_card4_body') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900">{{ $t('home.featured_products_title') }}</h2>
          <p class="text-gray-600 mt-2">{{ $t('home.featured_products_subtitle') }}</p>
        </div>
        <NuxtLink
          to="/produtos"
          class="text-blue-700 font-semibold hover:underline"
        >
          {{ $t('home.view_all') }} →
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-16 text-gray-500">
        {{ $t('home.loading_products') }}
      </div>

      <div v-else-if="error" class="text-center py-16 text-red-600">
        {{ $t('home.error_loading_products') }}
      </div>

      <div v-else class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>

    <div class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">{{ $t('home.how_title') }}</h2>
            <p class="text-gray-600 mt-2">
              {{ $t('home.how_subtitle') }}
            </p>

            <div class="mt-6 space-y-4">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <div class="font-bold text-gray-900">{{ $t('home.step1_title') }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ $t('home.step1_body') }}</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <div class="font-bold text-gray-900">{{ $t('home.step2_title') }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ $t('home.step2_body') }}</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <div class="font-bold text-gray-900">{{ $t('home.step3_title') }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ $t('home.step3_body') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <div class="text-blue-700 font-semibold">{{ $t('home.help_need_help') }}</div>
            <div class="text-2xl font-extrabold text-gray-900 mt-2">{{ $t('home.help_title') }}</div>
            <p class="text-gray-700 mt-3">
              {{ $t('home.help_body') }}
            </p>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <NuxtLink
                to="/produtos"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                {{ $t('buy_now') }}
              </NuxtLink>
              <NuxtLink
                to="/tutoriais"
                class="border border-blue-600 text-blue-700 hover:bg-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                {{ $t('view_tutorials') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const forwardedHeaders = import.meta.server
  ? useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host'])
  : undefined

const forwardedHost = import.meta.server
  ? String((forwardedHeaders as any)?.['x-forwarded-host'] || (forwardedHeaders as any)?.['x-original-host'] || (forwardedHeaders as any)?.host || '')
  : ''

const fetchHeaders = import.meta.server
  ? ({
      'x-forwarded-host': forwardedHost
    } as Record<string, string>)
  : undefined

const asyncKey = import.meta.server ? `best-sellers:${forwardedHost}` : 'best-sellers'

const { data, pending, error } = await useAsyncData(
  asyncKey,
  async () => {
    try {
      return await $fetch('/api/products/best-sellers', {
        headers: fetchHeaders as any
      })
    } catch (err) {
      console.error('[home][best-sellers] failed', err)
      return []
    }
  },
  {
    server: true,
    default: () => []
  }
)

const products = computed(() => (Array.isArray(data.value) ? data.value : []))
</script>
