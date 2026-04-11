<template>
  <section class="border-y bg-white">
    <div class="max-w-7xl mx-auto px-6 py-14">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ $t('home.why_title') }}</h2>
        <p class="mt-3 text-gray-500 text-base leading-relaxed">{{ $t('home.why_subtitle') }}</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="card in cards"
          :key="card.icon"
          class="group rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors p-6"
        >
          <div class="mb-4 text-2xl leading-none">{{ card.icon }}</div>
          <div class="font-bold text-gray-900 mb-1.5">{{ $t(card.titleKey) }}</div>
          <div class="text-sm text-gray-500 leading-relaxed">{{ $t(card.bodyKey) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const cards = [
  { icon: '✅', titleKey: 'home.why_card1_title', bodyKey: 'home.why_card1_body' },
  { icon: '⚡', titleKey: 'home.why_card2_title', bodyKey: 'home.why_card2_body' },
  { icon: '📘', titleKey: 'home.why_card3_title', bodyKey: 'home.why_card3_body' },
  { icon: '💬', titleKey: 'home.why_card4_title', bodyKey: 'home.why_card4_body' },
] as const
</script>
