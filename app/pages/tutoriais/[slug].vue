<script setup lang="ts">
definePageMeta({ ssr: false })

const intl = useIntlContext()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      defaultTitle: 'Activation tutorial',
      loading: 'Loading tutorial...',
      notFound: 'Tutorial not found',
      noContent: 'No content.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      defaultTitle: 'Tutorial de activación',
      loading: 'Cargando tutorial...',
      notFound: 'Tutorial no encontrado',
      noContent: 'Sin contenido.'
    }
  }

  return {
    defaultTitle: 'Tutorial de Ativação',
    loading: 'Carregando tutorial...',
    notFound: 'Tutorial não encontrado',
    noContent: 'Sem conteúdo.'
  }
})

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}?includeTutorial=1`,
  { server: false }
)

const tutorial = computed(() => {
  const p: any = data.value
  if (!p) return null

  return {
    title: p.tutorialTitle || t.value.defaultTitle,
    content: p.tutorialContent || ''
  }
})

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isSafeHref(url: string) {
  const u = String(url || '').trim()
  return /^https?:\/\//i.test(u) || /^mailto:/i.test(u)
}

function linkifyText(input: string) {
  const escaped = escapeHtml(String(input || ''))

  // [text](url)
  const withMarkdownLinks = escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
    const href = String(url || '')
    if (!isSafeHref(href)) return `${text} (${href})`
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${text}</a>`
  })

  // plain URLs
  return withMarkdownLinks.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const href = String(url || '')
    if (!isSafeHref(href)) return href
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${href}</a>`
  })
}

const tutorialHtml = computed(() => {
  const raw = String(tutorial.value?.content || '')
  const normalized = raw.replace(/\r\n/g, '\n')
  const blocks = normalized.split(/\n{2,}/g)
  const html = blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p class="mb-4 whitespace-pre-wrap">${linkifyText(b)}</p>`)
    .join('')
  return html || `<p class="text-gray-500">${escapeHtml(t.value.noContent)}</p>`
})
</script>

<template>
  <section class="py-20">
    <div class="max-w-4xl mx-auto px-6">

      <div v-if="pending" class="text-gray-500">
        {{ t.loading }}
      </div>

      <div v-else-if="error || !tutorial">
        <h1 class="text-2xl font-bold">
          {{ t.notFound }}
        </h1>
      </div>

      <div v-else>
        <h1 class="text-3xl font-bold mb-6">
          {{ tutorial.title }}
        </h1>

        <div class="bg-gray-50 p-6 rounded-lg text-sm" v-html="tutorialHtml" />
      </div>

    </div>
  </section>
</template>
