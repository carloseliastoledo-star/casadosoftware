<template>
  <div class="py-10">
    <div class="rounded-3xl border border-green-100 bg-green-50 p-8 shadow-sm">
      <div class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-green-700">
        <span>✔</span>
        Payment confirmed
      </div>

      <h1 class="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">Thank you for your purchase!</h1>
      <p class="mt-3 text-sm text-gray-700">
        Your delivery instructions will be available here, and you will also receive everything by email.
      </p>

      <div class="mt-8 grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl bg-white p-6">
          <div class="font-extrabold text-gray-900">Delivery</div>
          <p class="mt-2 text-sm text-gray-700">Check your email for your license and activation instructions.</p>
        </div>
        <div class="rounded-2xl bg-white p-6">
          <div class="font-extrabold text-gray-900">Need help?</div>
          <p class="mt-2 text-sm text-gray-700">Visit the FAQ or contact support if you have any questions.</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <NuxtLink to="/" class="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700">
          Back to Home
        </NuxtLink>
        <NuxtLink to="/faq" class="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-50">
          View FAQ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Payment Success',
  description: 'Payment confirmed. View delivery instructions for your software license.'
})
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
</style>
