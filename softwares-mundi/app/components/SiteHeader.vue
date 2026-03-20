<template>
  <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
    <div class="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-extrabold tracking-tight">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white">
            SM
          </span>
          <span class="text-lg">Softwares Mundi</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm font-semibold text-gray-700 md:flex">
          <NuxtLink to="/category/microsoft" class="hover:text-brand-blue">Microsoft</NuxtLink>
          <NuxtLink to="/category/adobe" class="hover:text-brand-blue">Adobe</NuxtLink>
          <NuxtLink to="/category/antivirus-security" class="hover:text-brand-blue">Security</NuxtLink>
          <NuxtLink to="/faq" class="hover:text-brand-blue">FAQ</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-brand-blue">Contact</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/#featured"
            class="hidden rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 md:inline-flex"
          >
            Shop Now
          </NuxtLink>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-700 md:hidden"
            @click="isOpen = !isOpen"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="isOpen" class="pb-4 md:hidden">
        <div class="grid gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-sm font-semibold text-gray-700 shadow-sm">
          <NuxtLink to="/category/microsoft" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">Microsoft</NuxtLink>
          <NuxtLink to="/category/adobe" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">Adobe</NuxtLink>
          <NuxtLink to="/category/antivirus-security" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">Antivirus & Security</NuxtLink>
          <NuxtLink to="/category/utilities" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">Utilities</NuxtLink>
          <NuxtLink to="/faq" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">FAQ</NuxtLink>
          <NuxtLink to="/contact" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">Contact</NuxtLink>
          <NuxtLink to="/about" class="rounded-xl px-3 py-2 hover:bg-gray-50" @click="isOpen = false">About</NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
</style>
