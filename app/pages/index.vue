<template>
  <HomeCasaSoftware v-if="isCasaDoSoftware" />
  <HomeLicencasDigitais v-else-if="isLicencasDigitais" />
  <HomeCenterKeys v-else :only-best-sellers="false" />

  <div v-if="debugHost" class="fixed bottom-3 left-3 z-[9999] max-w-[92vw] rounded-lg bg-black/70 text-white text-xs p-3">
    <div><b>host:</b> {{ host }}</div>
    <div><b>normalizedHost:</b> {{ normalizedHost }}</div>
    <div><b>storeSlug:</b> {{ storeSlug }}</div>
    <div><b>isCasaDoSoftware:</b> {{ isCasaDoSoftware }}</div>
    <div><b>isLicencasDigitais:</b> {{ isLicencasDigitais }}</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: true })

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const host = computed(() => {
  if (process.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch {
      // ignore
    }

    const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<
      string,
      string | undefined
    >
    const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
    const first = String(raw).split(',')[0]?.trim()
    return String(first || '').toLowerCase()
  }

  return String(window.location.host || '').toLowerCase()
})

const normalizedHost = computed(() => {
  const h0 = String(host.value || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
})

const isCasaDoSoftware = computed(() => {
  if (normalizedHost.value.includes('casadosoftware.com.br')) return true
  return storeSlug.value === 'casadosoftware'
})

const isLicencasDigitais = computed(() => {
  if (normalizedHost.value.includes('licencasdigitais.com.br')) return true
  return storeSlug.value === 'licencasdigitais'
})

watchEffect(() => {
  setPageLayout(isLicencasDigitais.value ? 'eletrokeys' : 'default')
})

const debugHost = computed(() => {
  if (process.server) return false
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('debugHost') === '1'
  } catch {
    return false
  }
})
</script>
