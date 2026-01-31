<template>
  <HomeCasaSoftware v-if="isCasaDoSoftware" />
  <HomeCenterKeys v-else />
</template>

<script setup lang="ts">
definePageMeta({ ssr: true })

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const host = computed(() => {
  if (process.server) {
    const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
    const raw = headers?.['x-forwarded-host'] || headers?.host || ''
    const first = String(raw).split(',')[0]?.trim()
    return String(first || '').toLowerCase()
  }

  return String(window.location.host || '').toLowerCase()
})

const isCasaDoSoftware = computed(() => {
  if (storeSlug.value === 'casadosoftware') return true
  return host.value.includes('casadosoftware.com.br')
})
</script>
