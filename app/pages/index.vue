<template>
  <HomeCasaSoftware v-if="isCasaDoSoftware" />
  <HomeCenterKeys v-else-if="isLicencasDigitais" :only-best-sellers="true" />
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

import { useJsonLd } from '~/composables/useJsonLd'
import { getCasaHomeJsonLdBundle } from '~/services/casaJsonLd'

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const baseUrl = useSiteUrl()

const CASA_HOME_TITLE = 'Licenças Originais Windows e Office | Casa do Software'
const CASA_HOME_DESCRIPTION =
  'Compre licenças digitais originais Windows 10, 11 e Office com entrega imediata e suporte técnico.'

const host = computed(() => {
  if (process.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch {
      // ignore
    }

    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<
        string,
        string | undefined
      >
      const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
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

const applyCasaSeo = computed(() => {
  if (storeSlug.value && storeSlug.value !== 'casadosoftware') return false
  if (isCasaDoSoftware.value) return true
  if (process.server && !normalizedHost.value) return true
  return false
})

watchEffect(() => {
  setPageLayout('default' as any)
})

if (applyCasaSeo.value) {
  const ogImage = '/logo-casa-do-software.png'

  useSeoMeta({
    title: CASA_HOME_TITLE,
    description: CASA_HOME_DESCRIPTION,
    ogTitle: CASA_HOME_TITLE,
    ogDescription: CASA_HOME_DESCRIPTION,
    ogImage,
    ogType: 'website',
    twitterTitle: CASA_HOME_TITLE,
    twitterDescription: CASA_HOME_DESCRIPTION,
    twitterImage: ogImage
  })
}

useHead(() => {
  if (!applyCasaSeo.value) return {}

  let canonicalBase = ''
  if (process.server) {
    try {
      const url = useRequestURL()
      canonicalBase = String(url?.origin || '').trim()
    } catch {
      // ignore
    }
  } else {
    try {
      canonicalBase = String(window.location.origin || '').trim()
    } catch {
      // ignore
    }
  }

  canonicalBase = canonicalBase.replace(/\/+$/, '')

  const alternates = [
    { hreflang: 'pt-BR', href: 'https://casadosoftware.com.br/' },
    { hreflang: 'en', href: 'https://en.casadosoftware.com.br/' },
    { hreflang: 'es', href: 'https://es.casadosoftware.com.br/' },
    { hreflang: 'fr', href: 'https://fr.casadosoftware.com.br/' },
    { hreflang: 'de', href: 'https://de.casadosoftware.com.br/' },
    { hreflang: 'x-default', href: 'https://casadosoftware.com.br/' }
  ]

  return {
    link: [
      ...(canonicalBase ? [{ rel: 'canonical', href: `${canonicalBase}/` }] : []),
      ...alternates.map((a) => ({ rel: 'alternate', hreflang: a.hreflang, href: a.href }))
    ],
    script: []
  }
})

useJsonLd(
  () => {
    if (!applyCasaSeo.value) return null

    let origin = ''
    let jsonLdHost = normalizedHost.value
    if (process.server) {
      try {
        const url = useRequestURL()
        origin = String(url?.origin || '').trim()
        jsonLdHost = String(url?.host || normalizedHost.value || '').trim().toLowerCase()
      } catch {
        // ignore
      }
    } else {
      try {
        origin = String(window.location.origin || '')
      } catch {
        // ignore
      }

      try {
        jsonLdHost = String(window.location.host || '').toLowerCase()
      } catch {
        // ignore
      }
    }

    return getCasaHomeJsonLdBundle({ host: jsonLdHost, origin })
  },
  'jsonld-casa-home'
)

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
