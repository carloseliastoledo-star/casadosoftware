<script setup lang="ts">
import DOMPurify from 'dompurify'

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

function extractYouTubeId(url: string) {
  const u = String(url || '').trim()
  if (!/^https?:\/\//i.test(u)) return ''

  const short = u.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{6,})/i)
  if (short?.[1]) return short[1]

  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/i)
  if (watch?.[1]) return watch[1]

  const embed = u.match(/^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i)
  if (embed?.[1]) return embed[1]

  return ''
}

function renderYouTubeEmbed(id: string) {
  const safeId = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '')
  if (!safeId) return ''

  return `
<div class="my-6 aspect-video w-full overflow-hidden rounded-lg bg-black/5">
  <iframe
    class="h-full w-full"
    src="https://www.youtube-nocookie.com/embed/${safeId}"
    title="YouTube video"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
`.trim()
}

function renderImage(src: string, alt: string) {
  const href = String(src || '').trim()
  if (!isSafeHref(href)) return ''

  const safeAlt = escapeHtml(String(alt || '').trim())
  const safeSrc = escapeHtml(href)

  return `
<figure class="my-6">
  <img src="${safeSrc}" alt="${safeAlt}" class="max-w-full rounded-lg border bg-white" loading="lazy" />
</figure>
`.trim()
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

function renderTutorialBlock(rawBlock: string) {
  const block = String(rawBlock || '').trim()
  if (!block) return ''

  // YouTube link alone on a line => embed
  if (/^https?:\/\//i.test(block) && !/\s/.test(block)) {
    const ytId = extractYouTubeId(block)
    if (ytId) return renderYouTubeEmbed(ytId)
  }

  // Image markdown alone => image
  const imageOnly = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
  if (imageOnly) {
    const img = renderImage(imageOnly[2], imageOnly[1])
    if (img) return img
  }

  const escaped = escapeHtml(block)

  // Inline image markdown (still safe, we build the <img> ourselves)
  const withImages = escaped.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
    const img = renderImage(String(url || ''), String(alt || ''))
    return img || _m
  })

  // Finally linkify the remaining text (but keep any generated tags).
  const placeholder = '__HTML_BLOCK__'
  const htmlBlocks: string[] = []
  const textWithPlaceholders = withImages.replace(/<figure[\s\S]*?<\/figure>/g, (m) => {
    htmlBlocks.push(m)
    return `${placeholder}${htmlBlocks.length - 1}${placeholder}`
  })

  const linked = linkifyText(textWithPlaceholders)
  const restored = linked.replace(new RegExp(`${placeholder}(\\d+)${placeholder}`, 'g'), (_m, idx) => {
    const i = Number(idx)
    return htmlBlocks[i] || ''
  })

  return `<p class="mb-4 whitespace-pre-wrap">${restored}</p>`
}

const tutorialHtml = computed(() => {
  const raw = String(tutorial.value?.content || '')
  const normalized = raw.replace(/\r\n/g, '\n')
  const blocks = normalized.split(/\n{2,}/g)
  const html = blocks
    .map((b) => renderTutorialBlock(b))
    .filter(Boolean)
    .join('')

  const fallback = `<p class="text-gray-500">${escapeHtml(t.value.noContent)}</p>`
  const content = html || fallback

  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'referrerpolicy']
  })
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
