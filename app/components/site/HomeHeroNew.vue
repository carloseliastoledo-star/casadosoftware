<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white">
    <div class="max-w-7xl mx-auto px-6 pt-14 pb-12">
      <div class="grid lg:grid-cols-2 gap-12 items-center">

        <!-- Coluna esquerda: headline + CTAs -->
        <div class="space-y-7">
          <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            {{ $t('home.badge_instant_email') }}
          </div>

          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            {{ $t('home.hero_title') }}
          </h1>

          <p class="text-gray-500 text-lg leading-relaxed max-w-xl">
            {{ $t('home.hero_description') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              :to="productsIndexPath"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-7 py-3.5 text-base font-bold text-white transition shadow-md shadow-blue-200/60"
            >
              {{ $t('home.view_products') }}
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/tutoriais"
              class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:text-blue-700 px-7 py-3.5 text-base font-semibold text-gray-700 transition"
            >
              {{ $t('view_tutorials') }}
            </NuxtLink>
          </div>

          <!-- Sinais de confiança -->
          <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 pt-1">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-green-500 font-bold">✓</span>{{ $t('home.trust_secure_purchase') }}
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-green-500 font-bold">✓</span>{{ $t('home.trust_instant_delivery') }}
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-green-500 font-bold">✓</span>{{ $t('home.trust_fast_support') }}
            </span>
          </div>
        </div>

        <!-- Coluna direita: card produto destaque -->
        <div class="hidden lg:block">
          <div class="relative">
            <div class="absolute -inset-3 rounded-[2.5rem] bg-blue-600/5 blur-sm" aria-hidden="true" />
            <div class="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 shadow-2xl shadow-blue-900/25 text-white">
              <div class="text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-3">
                {{ $t('home.featured_badge') }}
              </div>
              <div class="text-2xl font-extrabold leading-snug mb-2">{{ $t('home.featured_title') }}</div>
              <p class="text-sm text-blue-100 leading-relaxed mb-6">
                {{ $t('home.featured_description') }}
              </p>
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="rounded-2xl bg-white/10 hover:bg-white/20 transition p-5">
                  <div class="font-bold text-white text-base">Windows</div>
                  <div class="text-sm text-blue-200 mt-1">10 / 11 Pro</div>
                </div>
                <div class="rounded-2xl bg-white/10 hover:bg-white/20 transition p-5">
                  <div class="font-bold text-white text-base">Office</div>
                  <div class="text-sm text-blue-200 mt-1">2021 / 365</div>
                </div>
              </div>
              <NuxtLink
                :to="productsIndexPath"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-base font-bold text-blue-700 hover:bg-blue-50 transition"
              >
                {{ $t('home.start_now') }}
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ productsIndexPath: string }>()
</script>
