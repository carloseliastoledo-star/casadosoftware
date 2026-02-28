<template>
  <template v-if="isPublicSite && bodyOpenHtml">
    <div v-html="bodyOpenHtml" />
  </template>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <template v-if="isPublicSite && bodyCloseHtml">
    <div v-html="bodyCloseHtml" />
  </template>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

const { data: siteSettings } = await useFetch('/api/site-settings')

const isPublicSite = computed(() => !String(route.path || '').startsWith('/admin'))

const headHtml = computed(() => String((siteSettings.value as any)?.settings?.headHtml || ''))
const bodyOpenHtml = computed(() => String((siteSettings.value as any)?.settings?.bodyOpenHtml || ''))
const bodyCloseHtml = computed(() => String((siteSettings.value as any)?.settings?.bodyCloseHtml || ''))

const googleAnalyticsId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAnalyticsId
  return String(fromDb || config.public.googleAnalyticsId || '')
})

const googleAdsConversionId = computed(() => {
  const fromDb = (siteSettings.value as any)?.settings?.googleAdsConversionId
  return String(fromDb || config.public.googleAdsConversionId || '')
})

function parseTagAttrs(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {}

  raw.replace(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g, (_, key: string, v1: string, v2: string, v3: string) => {
    const value = v1 ?? v2 ?? v3
    if (value === undefined) {
      attrs[key] = true
    } else {
      attrs[key] = String(value)
    }
    return ''
  })

  return attrs
}

function parseHeadHtmlToUseHead(html: string) {
  const raw = String(html || '').trim()
  if (!raw) return {}

  const meta: Array<Record<string, any>> = []
  const link: Array<Record<string, any>> = []
  const script: Array<Record<string, any>> = []
  const style: Array<Record<string, any>> = []

  const metaRe = /<meta\b([^>]*?)\/?>(?:\s*)/gi
  const linkRe = /<link\b([^>]*?)\/?>(?:\s*)/gi
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
  const styleRe = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi

  let m: RegExpExecArray | null

  while ((m = metaRe.exec(raw))) {
    const attrs = parseTagAttrs(m[1] || '')
    meta.push(attrs)
  }

  while ((m = linkRe.exec(raw))) {
    const attrs = parseTagAttrs(m[1] || '')
    link.push(attrs)
  }

  while ((m = styleRe.exec(raw))) {
    const attrs = parseTagAttrs(m[1] || '')
    const content = String(m[2] || '').trim()
    style.push({ ...attrs, innerHTML: content })
  }

  while ((m = scriptRe.exec(raw))) {
    const attrs = parseTagAttrs(m[1] || '')
    const content = String(m[2] || '').trim()
    const { src, ...rest } = attrs as any

    if (typeof src === 'string' && src.trim()) {
      script.push({ ...rest, src })
      continue
    }

    if (content) {
      script.push({ ...rest, innerHTML: content })
    }
  }

  return {
    meta: meta.length ? meta : undefined,
    link: link.length ? link : undefined,
    script: script.length ? script : undefined,
    style: style.length ? style : undefined,
  }
}

useHead(() => {
  if (!isPublicSite.value) return {}
  return parseHeadHtmlToUseHead(headHtml.value)
})

useHead(() => {
  const gaId = googleAnalyticsId.value
  const adsId = googleAdsConversionId.value

  const primaryId = gaId || adsId
  if (!primaryId) return {}

  return {
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryId)}`,
        async: true
      }
    ]
  }
})
</script>
