<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{ error: Record<string, any> }>()

const { locale } = useI18n()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)
const is404 = computed(() => statusCode.value === 404)

const heading = computed(() => {
  if (!is404.value) return locale.value === 'pt' ? 'Erro no servidor' : 'Server error'
  return locale.value === 'pt' ? 'Página não encontrada' : 'Page not found'
})

const message = computed(() => {
  if (!is404.value) return locale.value === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.'
  return locale.value === 'pt'
    ? 'A URL solicitada não existe neste site.'
    : 'The requested URL does not exist on this site.'
})

const homeLabel = computed(() => locale.value === 'pt' ? 'Voltar ao início' : 'Back to home')

if (import.meta.server) {
  try {
    const event = useRequestEvent()
    if (event) setResponseStatus(event, statusCode.value)
  } catch {}
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <p class="text-6xl font-extrabold text-blue-600 mb-4">{{ statusCode }}</p>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ heading }}</h1>
    <p class="text-gray-500 mb-8 max-w-md">{{ message }}</p>
    <p v-if="props.error?.message" class="text-xs text-red-400 mb-4 max-w-lg font-mono break-all">{{ props.error.message }}</p>
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition"
    >
      {{ homeLabel }}
    </NuxtLink>
  </div>
</template>
