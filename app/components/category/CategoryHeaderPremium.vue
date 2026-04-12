<template>
  <div class="bg-white border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-5 pt-6 pb-5">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/categorias" class="hover:text-blue-600 transition-colors">Softwares</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="text-gray-700 font-medium">{{ displayName }}</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
            {{ displayName || 'Softwares em destaque' }}
          </h1>
          <p class="mt-1.5 text-sm text-gray-500">
            <template v-if="productCount > 0">
              {{ productCount }} produto{{ productCount === 1 ? '' : 's' }} disponíve{{ productCount === 1 ? 'l' : 'is' }}
              — Escolha a melhor opção para ativar com rapidez e praticidade
            </template>
            <template v-else>
              Escolha a melhor opção para ativar com rapidez e praticidade
            </template>
          </p>
        </div>

        <!-- Trust line -->
        <div class="flex items-center gap-3 sm:gap-5 shrink-0 flex-wrap">
          <span class="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
            <svg class="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Licença digital
          </span>
          <span class="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
            <svg class="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Entrega imediata
          </span>
          <span class="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
            <svg class="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Suporte incluso
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categoryName: string
  productCount: number
}>()

const displayName = computed(() =>
  String(props.categoryName || '').normalize('NFC')
)
</script>
