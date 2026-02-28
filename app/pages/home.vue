<template>
  <HomeCasaSoftware v-if="isCasaDoSoftware" />
  <HomeCenterKeys v-else :only-best-sellers="isLicencasDigitais" />
</template>

<script setup lang="ts">
definePageMeta({ ssr: true })

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

  let siteUrl = ''
  try {
    const url = useRequestURL()
    siteUrl = String(url?.origin || '')
  } catch {
    // ignore
  }

  if (!siteUrl) {
    const h = String(normalizedHost.value || '').trim()
    if (h) siteUrl = `https://${h}`
  }

  const canonicalBase = String(baseUrl || siteUrl || '').trim().replace(/\/+$/, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Casa do Software',
        url: siteUrl || undefined,
        logo: siteUrl ? `${siteUrl}/logo-casa-do-software.png` : '/logo-casa-do-software.png'
      },
      {
        '@type': 'WebSite',
        name: 'Casa do Software',
        url: siteUrl || undefined
      }
    ]
  }

  return {
    link: canonicalBase ? [{ rel: 'canonical', href: `${canonicalBase}/` }] : [],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd)
      }
    ]
  }
})
</script>
