<template>
  <div v-if="links.length" class="mt-6 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
    <span class="font-medium text-gray-700">{{ label }}:</span>
    <span v-for="(link, i) in links" :key="link.lang" class="inline-flex items-center">
      <span v-if="i > 0" class="mx-1 text-gray-300">·</span>
      <NuxtLink
        :to="link.path"
        :hreflang="link.hreflang"
        class="ml-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        :class="{ 'text-gray-400 pointer-events-none': link.isCurrent }"
      >
        {{ link.label }}
      </NuxtLink>
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  type SeoPageType,
  pathForLang,
  detectLangFromPath,
  SEO_LANGS,
  HREFLANG_CODES
} from '~/composables/useSeoLocale'

const props = defineProps<{
  pageType: SeoPageType
  slug?: string
}>()

const route = useRoute()

const LANG_LABELS: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano'
}

const AVAILABLE_LABELS: Record<string, string> = {
  pt: 'This page is also available in',
  en: 'This page is also available in',
  es: 'Esta página también está disponible en',
  fr: 'Cette page est aussi disponible en',
  it: 'Questa pagina è disponibile anche in'
}

const currentLang = computed(() => detectLangFromPath(route.path))

const label = computed(() => AVAILABLE_LABELS[currentLang.value] || AVAILABLE_LABELS.en)

const links = computed(() =>
  SEO_LANGS
    .filter((l) => l !== currentLang.value)
    .map((lang) => ({
      lang,
      hreflang: HREFLANG_CODES[lang],
      path: pathForLang(props.pageType, lang, props.slug || ''),
      label: LANG_LABELS[lang] || lang.toUpperCase(),
      isCurrent: false
    }))
)
</script>
