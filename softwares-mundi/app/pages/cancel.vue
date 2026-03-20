<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Checkout canceled</h1>
      <p class="mt-3 text-sm text-gray-700">No worries — you can try again anytime.</p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <NuxtLink to="/" class="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700">
          Back to Home
        </NuxtLink>
        <NuxtLink to="/contact" class="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
          Contact support
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Checkout Canceled',
  description: 'Your checkout was canceled. Return to the store to try again.'
})
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
</style>
