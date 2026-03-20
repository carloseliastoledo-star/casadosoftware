<template>
  <div class="min-h-screen bg-white text-gray-900">
    <SiteHeader />

    <main class="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>
