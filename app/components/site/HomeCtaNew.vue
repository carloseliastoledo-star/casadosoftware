<template>
  <section class="border-t bg-gradient-to-b from-blue-50/40 to-white">
    <div class="max-w-7xl mx-auto px-6 py-14">
      <div class="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" aria-hidden="true" />
        <div class="relative p-8 md:p-12">
          <div class="grid lg:grid-cols-2 gap-10 items-center">

            <!-- Texto CTA -->
            <div>
              <div class="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-800 mb-5">
                {{ cta.kicker }}
                <span class="h-1 w-1 rounded-full bg-blue-300" aria-hidden="true" />
                <span class="font-bold text-blue-600">{{ cta.highlight }}</span>
              </div>

              <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-3">
                {{ cta.title }}
              </h2>
              <p class="text-gray-600 text-base leading-relaxed mb-7">{{ cta.subtitle }}</p>

              <div class="flex flex-col sm:flex-row items-start gap-4">
                <NuxtLink
                  :to="cta.to"
                  class="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 py-3.5 text-sm font-bold text-white transition shadow-sm shadow-blue-200"
                >
                  {{ cta.button }}
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </NuxtLink>
                <div class="hidden sm:flex items-center gap-1 text-sm text-gray-500 mt-1.5">
                  <span class="font-bold text-gray-800">{{ cta.noFees }}</span>
                  <span>{{ cta.startToday }}</span>
                </div>
              </div>
            </div>

            <!-- Card de stats -->
            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-7">
              <div class="flex items-center justify-between mb-5">
                <span class="text-sm font-bold text-gray-900">{{ cta.audienceTitle }}</span>
                <span class="text-xs font-bold rounded-full bg-blue-100 text-blue-700 px-3 py-1">{{ cta.worldwide }}</span>
              </div>

              <ul class="space-y-3 mb-6">
                <li v-for="item in cta.audiences" :key="item" class="flex items-center gap-3 text-gray-700">
                  <span class="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-blue-600 text-sm font-bold">✓</span>
                  <span class="text-sm font-medium">{{ item }}</span>
                </li>
              </ul>

              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <div class="text-xs text-gray-400 mb-1">{{ cta.statCommissionLabel }}</div>
                  <div class="font-extrabold text-gray-900">20%–30%</div>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <div class="text-xs text-gray-400 mb-1">{{ cta.statProductsLabel }}</div>
                  <div class="font-extrabold text-gray-900">{{ cta.statProductsValue }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface CtaData {
  to: string
  kicker: string
  highlight: string
  title: string
  subtitle: string
  button: string
  noFees: string
  startToday: string
  worldwide: string
  audienceTitle: string
  audiences: string[]
  statCommissionLabel: string
  statProductsLabel: string
  statProductsValue: string
}

defineProps<{ cta: CtaData }>()
</script>
