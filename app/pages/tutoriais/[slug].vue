<script setup lang="ts">
import { sanitizeRichHtml } from '../../utils/sanitizeRichHtml'

definePageMeta({ ssr: false })

const intl = useIntlContext()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      defaultTitle: 'Activation tutorial',
      loading: 'Loading tutorial...',
      notFound: 'Tutorial not found',
      noContent: 'No content.',
      accessDeniedTitle: 'Exclusive content for customers',
      accessDeniedBody: 'This tutorial is available only to customers who have completed a purchase.',
      accessDeniedLogin: 'Sign in to your account',
      accessDeniedBuy: 'Buy now and get access'
    }
  }

  if (intl.language.value === 'es') {
    return {
      defaultTitle: 'Tutorial de activación',
      loading: 'Cargando tutorial...',
      notFound: 'Tutorial no encontrado',
      noContent: 'Sin contenido.',
      accessDeniedTitle: 'Contenido exclusivo para clientes',
      accessDeniedBody: 'Este tutorial está disponible solo para clientes que han realizado una compra.',
      accessDeniedLogin: 'Inicia sesión en tu cuenta',
      accessDeniedBuy: 'Compra ahora y obtén acceso'
    }
  }

  return {
    defaultTitle: 'Tutorial de Ativação',
    loading: 'Carregando tutorial...',
    notFound: 'Tutorial não encontrado',
    noContent: 'Sem conteúdo.',
    accessDeniedTitle: 'Conteúdo exclusivo para clientes',
    accessDeniedBody: 'Este tutorial está disponível apenas para clientes que já realizaram uma compra.',
    accessDeniedLogin: 'Entrar na minha conta',
    accessDeniedBuy: 'Comprar agora e ter acesso'
  }
})

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}?includeTutorial=1`,
  { server: false }
)

const accessDenied = computed(() => Boolean((data.value as any)?.tutorialAccessDenied))

const tutorial = computed(() => {
  const p: any = data.value
  if (!p) return null

  return {
    title: p.tutorialTitle || t.value.defaultTitle,
    content: p.tutorialContent || ''
  }
})

const loginUrl = computed(() => {
  const returnPath = useRoute().fullPath
  return `/minha-conta/login?returnTo=${encodeURIComponent(returnPath)}`
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
  return /^https?:\/\//i.test(u) || /^mailto:/i.test(u) || u.startsWith('/')
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

  // Vimeo link alone on a line => embed
  if (/^https?:\/\//i.test(block) && !/\s/.test(block)) {
    const u = String(block)
    const m = u.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d{6,})/i)
    if (m?.[1]) {
      const id = String(m[1]).replace(/[^0-9]/g, '')
      if (id) {
        return `
<div class="my-6 aspect-video w-full overflow-hidden rounded-lg bg-black/5">
  <iframe
    class="h-full w-full"
    src="https://player.vimeo.com/video/${id}"
    title="Vimeo video"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</div>
`.trim()
      }
    }
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

  return sanitizeRichHtml(content, { allowIframes: true })
})
</script>

<template>
  <section class="py-20">
    <div class="max-w-4xl mx-auto px-6">

      <div v-if="pending" class="text-gray-500">
        {{ t.loading }}
      </div>

      <div v-else-if="error">
        <h1 class="text-2xl font-bold">{{ t.notFound }}</h1>
      </div>

      <!-- Gate de acesso negado -->
      <div v-else-if="accessDenied" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-4xl mb-6">🔒</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ t.accessDeniedTitle }}</h1>
        <p class="text-gray-600 max-w-md mx-auto mb-8">{{ t.accessDeniedBody }}</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            :to="loginUrl"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            🔑 {{ t.accessDeniedLogin }}
          </NuxtLink>
          <NuxtLink
            to="/produtos"
            class="inline-flex items-center gap-2 border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition"
          >
            🛒 {{ t.accessDeniedBuy }}
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="!tutorial">
        <h1 class="text-2xl font-bold">{{ t.notFound }}</h1>
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
