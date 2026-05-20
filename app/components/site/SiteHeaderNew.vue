<template>
  <header class="sticky top-0 z-40">
    <!-- Barra superior -->
    <div class="bg-[#0f172a] text-gray-300 text-xs py-2 px-6">
      <div class="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap text-center">
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
          Entrega digital imediata
        </span>
        <span class="hidden sm:inline">|</span>
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
          Suporte via WhatsApp
        </span>
        <span class="hidden sm:inline">|</span>
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296c.63.677 1.593 1.8 1.593 3.068z"/>
          </svg>
          Pagamento seguro
        </span>
        <span class="hidden sm:inline">|</span>
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
          </svg>
          Mais de 20 mil clientes atendidos
        </span>
      </div>
    </div>

    <!-- Header principal -->
    <div class="bg-white border-b shadow-sm">
      <div class="max-w-7xl mx-auto px-6">

        <!-- Barra principal -->
      <div class="h-12 md:h-14 flex items-center justify-between gap-4">

        <!-- Logo + nome -->
        <div class="flex items-center gap-2 min-w-0">
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            :aria-label="t.openMenu"
            @click="emit('update:mobileOpen', true)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <NuxtLink to="/" class="flex items-center gap-2 min-w-0">
            <picture>
              <source v-if="logoWebpPath" :srcset="logoWebpPath" type="image/webp" />
              <img :src="logoPath" :alt="siteName" class="h-9 md:h-10 w-auto object-contain" />
            </picture>
            <span class="hidden sm:block text-sm md:text-base font-extrabold tracking-tight text-gray-900 truncate">
              {{ siteName }}
            </span>
          </NuxtLink>
        </div>

        <!-- Busca desktop -->
        <form class="hidden md:flex flex-1 max-w-lg" @submit.prevent="emit('submit-search')">
          <div class="flex w-full rounded-lg overflow-hidden border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 shadow-sm transition">
            <input
              :value="searchQuery"
              type="search"
              :placeholder="t.searchPlaceholder"
              class="w-full h-9 bg-white px-4 text-sm outline-none placeholder-gray-400"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            />
            <button
              type="submit"
              class="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition flex-shrink-0 flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <span class="hidden lg:inline">{{ t.searchButton }}</span>
            </button>
          </div>
        </form>

        <!-- Ações direita -->
        <div class="flex items-center gap-1.5">
          <!-- Seletores de idioma/moeda (apenas domínio EN) -->
          <div v-if="isEnDomain" class="hidden md:flex items-center gap-1.5">
            <select
              class="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              class="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            class="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition px-3 py-1.5 rounded-lg"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            <span class="hidden lg:block">{{ t.myAccount }}</span>
          </NuxtLink>

          <!-- Carrinho -->
          <NuxtLink
            to="/checkout"
            class="relative inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm font-semibold transition shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.874-7.148a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            <span class="hidden sm:block">{{ t.cart }}</span>
            <span
              v-if="(cartCount ?? 0) > 0"
              class="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>

      </div>

      <!-- Barra de navegação desktop -->
      <nav class="hidden md:flex items-center gap-1 h-9 border-t">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
          </svg>
          {{ t.home }}
        </NuxtLink>

        <NuxtLink
          v-for="item in mainMenu.filter(i => !i.label.includes('Programa de Afiliados'))"
          :key="item.label"
          :to="item.to"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          {{ item.label }}
        </NuxtLink>

        <NuxtLink
          v-for="item in mainMenu.filter(i => i.label.includes('Programa de Afiliados'))"
          :key="item.label"
          :to="item.to"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

    </div>

    <!-- Faixa promocional -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-2 px-6">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold text-blue-900">Oferta do dia:</span>
          <span class="text-gray-700">Office 365 com entrega imediata no e-mail — ativação em minutos</span>
        </div>
        <NuxtLink
          to="/produtos/microsoft-office-365-vitalicio"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
        >
          Ver oferta
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Menu mobile -->
    <Teleport to="body">
      <div v-if="mobileOpen" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('update:mobileOpen', false)" />

        <div class="absolute inset-y-0 left-0 w-80 max-w-[92vw] bg-white shadow-2xl flex flex-col">
          <!-- Header do menu -->
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-2" @click="emit('update:mobileOpen', false)">
              <img :src="logoPath" :alt="siteName" class="h-9 w-auto" />
              <span class="font-extrabold text-gray-900 truncate text-sm">{{ siteName }}</span>
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
          <div class="px-4 pt-3">
            <form @submit.prevent="emit('submit-search'); emit('update:mobileOpen', false)">
              <div class="flex rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                <input
                  :value="searchQuery"
                  type="search"
                  :placeholder="t.searchPlaceholder"
                  class="w-full h-9 bg-white px-4 text-sm outline-none placeholder-gray-400"
                  @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                />
                <button type="submit" class="h-9 px-3 bg-blue-600 text-white font-semibold text-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Links de navegação -->
          <nav class="flex-1 overflow-y-auto px-3 py-3">
            <div v-if="isEnDomain" class="grid grid-cols-2 gap-2 mb-3">
              <select
                class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm font-semibold text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm font-semibold text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-800 font-semibold hover:bg-blue-50 transition"
                @click="emit('update:mobileOpen', false)"
              >
                <span class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">🏠</span>
                {{ t.home }}
              </NuxtLink>
              <NuxtLink
                v-for="item in mainMenu.filter(i => !i.label.includes('Programa de Afiliados'))"
                :key="item.label"
                :to="item.to"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-800 font-semibold hover:bg-blue-50 transition"
                @click="emit('update:mobileOpen', false)"
              >
                <span class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm">•</span>
                {{ item.label }}
              </NuxtLink>
              <NuxtLink
                v-for="item in mainMenu.filter(i => i.label.includes('Programa de Afiliados'))"
                :key="item.label"
                :to="item.to"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-blue-600 font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                @click="emit('update:mobileOpen', false)"
              >
                <span class="w-7 h-7 rounded-lg bg-blue-200 flex items-center justify-center text-blue-700 text-sm">🎯</span>
                {{ item.label }}
              </NuxtLink>
            </div>
          </nav>

          <!-- CTA no rodapé do menu -->
          <div class="p-3 border-t">
            <NuxtLink
              to="/checkout"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 transition"
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
