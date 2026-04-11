<template>
  <section class="bg-gray-50 border-b">
    <div class="max-w-7xl mx-auto px-6 py-14">
      <div class="flex items-end justify-between gap-6 mb-8 flex-wrap">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ $t('home.best_sellers_title') }}</h2>
          <p class="mt-2 text-gray-500 text-sm">{{ $t('home.best_sellers_subtitle') }}</p>
        </div>
        <NuxtLink
          :to="productsIndexPath"
          class="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          {{ $t('home.view_all') }}
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Slot para o grid de produtos -->
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ productsIndexPath: string }>()
</script>
