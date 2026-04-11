<template>
  <header class="bg-white border-b shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6">

      <!-- Barra principal -->
      <div class="h-16 md:h-18 flex items-center justify-between gap-4">

        <!-- Logo + nome -->
        <div class="flex items-center gap-3 min-w-0">
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            :aria-label="t.openMenu"
            @click="emit('update:mobileOpen', true)"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
            <picture>
              <source v-if="logoWebpPath" :srcset="logoWebpPath" type="image/webp" />
              <img :src="logoPath" :alt="siteName" class="h-10 md:h-12 w-auto object-contain" />
            </picture>
            <span class="hidden sm:block text-base md:text-lg font-extrabold tracking-tight text-gray-900 truncate">
              {{ siteName }}
            </span>
          </NuxtLink>
        </div>

        <!-- Busca desktop -->
        <form class="hidden md:flex flex-1 max-w-xl" @submit.prevent="emit('submit-search')">
          <div class="flex w-full rounded-xl overflow-hidden border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <input
              :value="searchQuery"
              type="search"
              :placeholder="t.searchPlaceholder"
              class="w-full h-10 bg-gray-50 px-4 text-sm outline-none"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            />
            <button
              type="submit"
              class="h-10 px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition flex-shrink-0"
            >
              {{ t.searchButton }}
            </button>
          </div>
        </form>

        <!-- Ações direita -->
        <div class="flex items-center gap-2">
          <!-- Seletores de idioma/moeda (apenas domínio EN) -->
          <div v-if="isEnDomain" class="hidden md:flex items-center gap-2">
            <select
              class="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700"
              :value="countryCode || 'AUTO'"
              aria-label="Country"
              @change="emit('country-change', ($event.target as HTMLSelectElement).value)"
            >
              <option value="AUTO">AUTO</option>
              <option value="BR">BR</option>
              <option value="US">US</option>
              <option value="GB">UK</option>
              <option value="ES">ES</option>
              <option value="PT">PT</option>
              <option value="DE">DE</option>
              <option value="FR">FR</option>
              <option value="IT">IT</option>
            </select>
            <select
              class="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700"
              :value="currency"
              aria-label="Currency"
              @change="emit('currency-change', ($event.target as HTMLSelectElement).value)"
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="brl">BRL</option>
            </select>
          </div>

          <!-- Minha conta -->
          <NuxtLink
            to="/minha-conta/login"
            class="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition px-2 py-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            <span class="hidden lg:block">{{ t.myAccount }}</span>
          </NuxtLink>

          <!-- Carrinho -->
          <NuxtLink
            to="/checkout"
            class="relative inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold transition shadow-sm shadow-blue-200/60"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.874-7.148a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            <span class="hidden sm:block">{{ t.cart }}</span>
            <span
              v-if="(cartCount ?? 0) > 0"
              class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>

      </div>

      <!-- Barra de navegação desktop -->
      <nav class="hidden md:flex items-center gap-1 h-11 border-t">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
          </svg>
          {{ t.home }}
        </NuxtLink>

        <NuxtLink
          v-for="item in mainMenu"
          :key="item.label"
          :to="item.to"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

    </div>

    <!-- Menu mobile -->
    <Teleport to="body">
      <div v-if="mobileOpen" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('update:mobileOpen', false)" />

        <div class="absolute inset-y-0 left-0 w-80 max-w-[92vw] bg-white shadow-2xl flex flex-col">
          <!-- Header do menu -->
          <div class="px-5 py-4 border-b flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-3" @click="emit('update:mobileOpen', false)">
              <img :src="logoPath" :alt="siteName" class="h-10 w-auto" />
              <span class="font-extrabold text-gray-900 truncate">{{ siteName }}</span>
            </NuxtLink>
            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              :aria-label="t.closeMenu"
              @click="emit('update:mobileOpen', false)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Busca mobile -->
          <div class="px-5 pt-4">
            <form @submit.prevent="emit('submit-search'); emit('update:mobileOpen', false)">
              <div class="flex rounded-xl overflow-hidden border border-gray-200">
                <input
                  :value="searchQuery"
                  type="search"
                  :placeholder="t.searchPlaceholder"
                  class="w-full h-10 bg-gray-50 px-4 text-sm outline-none"
                  @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                />
                <button type="submit" class="h-10 px-4 bg-orange-500 text-white font-bold text-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Links de navegação -->
          <nav class="flex-1 overflow-y-auto px-4 py-4">
            <div v-if="isEnDomain" class="grid grid-cols-2 gap-2 mb-4">
              <select
                class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
                :value="countryCode || 'AUTO'"
                aria-label="Country"
                @change="emit('country-change', ($event.target as HTMLSelectElement).value); emit('update:mobileOpen', false)"
              >
                <option value="AUTO">AUTO</option>
                <option value="BR">BR</option>
                <option value="US">US</option>
                <option value="GB">UK</option>
                <option value="ES">ES</option>
                <option value="PT">PT</option>
                <option value="DE">DE</option>
                <option value="FR">FR</option>
                <option value="IT">IT</option>
              </select>
              <select
                class="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
                :value="currency"
                aria-label="Currency"
                @change="emit('currency-change', ($event.target as HTMLSelectElement).value); emit('update:mobileOpen', false)"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="brl">BRL</option>
              </select>
            </div>

            <div class="space-y-1">
              <NuxtLink
                to="/"
                class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-800 font-semibold hover:bg-gray-50 transition"
                @click="emit('update:mobileOpen', false)"
              >
                <span class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">🏠</span>
                {{ t.home }}
              </NuxtLink>
              <NuxtLink
                v-for="item in mainMenu"
                :key="item.label"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-800 font-semibold hover:bg-gray-50 transition"
                @click="emit('update:mobileOpen', false)"
              >
                <span class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">•</span>
                {{ item.label }}
              </NuxtLink>
            </div>
          </nav>

          <!-- CTA no rodapé do menu -->
          <div class="p-4 border-t">
            <NuxtLink
              to="/checkout"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 transition"
              @click="emit('update:mobileOpen', false)"
            >
              {{ t.goToCart }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
interface MenuItem { label: string; to: string }

interface Translations {
  home: string
  openMenu: string
  closeMenu: string
  searchPlaceholder: string
  searchButton: string
  myAccount: string
  cart: string
  goToCart: string
}

interface Props {
  siteName: string
  logoPath: string
  logoWebpPath?: string
  cartCount?: number
  mainMenu?: MenuItem[]
  searchQuery?: string
  mobileOpen?: boolean
  isEnDomain?: boolean
  countryCode?: string
  currency?: string
  t: Translations
}

withDefaults(defineProps<Props>(), {
  cartCount: 0,
  mainMenu: () => [],
  searchQuery: '',
  mobileOpen: false,
  isEnDomain: false,
})

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:mobileOpen': [value: boolean]
  'submit-search': []
  'currency-change': [value: string]
  'country-change': [value: string]
}>()
</script>
