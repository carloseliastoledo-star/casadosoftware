<template>
  <section class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-6 py-14">
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ title }}</h2>
        <p class="mt-2 text-gray-500 text-sm">{{ subtitle }}</p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/categoria/${cat.slug}`"
          class="group rounded-xl border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div class="text-3xl mb-3">{{ getCategoryIcon(cat.slug) }}</div>
          <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {{ cat.nome }}
          </h3>
          <p class="text-sm text-gray-600 mt-2">
            {{ getCategoryDescription(cat.slug) }}
          </p>
          <div class="mt-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
            {{ viewCategory }} →
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CategoriaLinkDto } from '~/types/categoria'

interface Props {
  categories: CategoriaLinkDto[]
}

const props = defineProps<Props>()

const intl = useIntlContext()

const title = computed(() => {
  return intl.language.value === 'en' ? 'Choose by category' : 'Escolha por categoria'
})

const subtitle = computed(() => {
  return intl.language.value === 'en'
    ? 'Find the right software for your needs'
    : 'Encontre o software certo para suas necessidades'
})

const viewCategory = computed(() => {
  return intl.language.value === 'en' ? 'View products' : 'Ver produtos'
})

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    'windows': '🪟',
    'windows-server': '🖥️',
    'office': '📊',
    'autodesk': '🏗️',
    'antivirus': '🛡️',
    'jogos': '🎮',
    'corel': '🎨'
  }
  return icons[slug] || '💻'
}

function getCategoryDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'windows': 'Windows 10, Windows 11 e licenças digitais para ativação.',
    'windows-server': 'Windows Server e licenças para servidores.',
    'office': 'Office 365, Office 2024, Office 2021 e pacotes profissionais.',
    'autodesk': 'AutoCAD, Revit, Inventor, Civil 3D e softwares profissionais.',
    'antivirus': 'Soluções de segurança digital para computadores e dispositivos.',
    'jogos': 'Licenças digitais, gift cards e produtos gamer.',
    'corel': 'CorelDRAW e softwares de design gráfico.'
  }
  return descriptions[slug] || 'Licenças digitais e soluções de software.'
}
</script>
