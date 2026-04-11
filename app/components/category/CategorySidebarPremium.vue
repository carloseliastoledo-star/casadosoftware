<template>
  <aside class="w-full lg:w-72 shrink-0">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-24">
      <!-- Título -->
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-xs font-black text-gray-700 uppercase tracking-widest">Categorias</h2>
      </div>

      <!-- Lista de categorias -->
      <nav aria-label="Categorias de produto">
        <ul class="py-1.5">
          <li v-for="cat in categories" :key="cat.slug">
            <NuxtLink
              :to="`/categoria/${cat.slug}`"
              class="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all duration-150"
              :class="currentSlug === cat.slug
                ? 'bg-blue-50 text-blue-700 border-r-[3px] border-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-slate-50 hover:text-blue-700'"
            >
              <span class="text-base leading-none shrink-0" aria-hidden="true">{{ cat.icon }}</span>
              <span class="truncate">{{ cat.name }}</span>
              <svg
                v-if="currentSlug === cat.slug"
                class="w-3.5 h-3.5 text-blue-500 ml-auto shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Trust badges -->
      <div class="px-5 py-4 border-t border-slate-100 bg-slate-50 space-y-2.5">
        <div class="flex items-center gap-2.5 text-xs text-gray-500">
          <span class="text-sm" aria-hidden="true">🔒</span>
          <span>Compra 100% segura</span>
        </div>
        <div class="flex items-center gap-2.5 text-xs text-gray-500">
          <span class="text-sm" aria-hidden="true">⚡</span>
          <span>Ativação imediata</span>
        </div>
        <div class="flex items-center gap-2.5 text-xs text-gray-500">
          <span class="text-sm" aria-hidden="true">🛡️</span>
          <span>Garantia de 30 dias</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  currentSlug?: string
}>()

const categories = [
  { slug: 'office',         name: 'Microsoft Office',  icon: '📄' },
  { slug: 'windows',        name: 'Windows',           icon: '🪟' },
  { slug: 'project',        name: 'Project',           icon: '📊' },
  { slug: 'visio',          name: 'Visio',             icon: '📐' },
  { slug: 'windows-server', name: 'Windows Server',    icon: '🖥️' },
  { slug: 'antivirus',      name: 'Antivírus',         icon: '🛡️' },
  { slug: 'outros',         name: 'Outros Softwares',  icon: '🔧' },
]
</script>
