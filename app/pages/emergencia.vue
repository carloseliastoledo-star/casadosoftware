<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10">
    <section class="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm">
      <p class="text-xs font-bold uppercase tracking-widest text-blue-600">Modo Emergencial</p>
      <h1 class="mt-3 text-3xl font-black text-gray-900">Oferta principal disponível</h1>
      <p class="mt-3 text-sm text-gray-600">Compra segura com entrega digital. Esta página funciona mesmo durante instabilidades.</p>

      <ul class="mt-6 space-y-2 text-sm text-gray-700">
        <li>Licenças originais Windows e Office</li>
        <li>Entrega digital imediata</li>
        <li>Suporte humano via WhatsApp</li>
      </ul>

      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <NuxtLink to="/checkout" class="inline-flex w-full justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 sm:w-auto">
          Comprar agora
        </NuxtLink>
        <a href="https://wa.me/5511910512647" target="_blank" rel="noopener" class="inline-flex w-full justify-center rounded-xl border border-green-600 px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50 sm:w-auto">
          WhatsApp
        </a>
      </div>

      <p class="mt-6 text-xs font-medium text-gray-500">Compra segura com entrega digital</p>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

useSeoMeta({
  title: 'Página Emergencial | Casa do Software',
  description: 'Canal rápido de compra segura com entrega digital.'
})
</script>
