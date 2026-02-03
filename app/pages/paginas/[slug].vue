<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-8">
        <div v-if="pending" class="text-sm text-gray-600">{{ t.loading }}</div>
        <div v-else-if="error" class="text-sm text-red-600">{{ t.notFound }}</div>

        <div v-else>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">{{ pagina?.titulo }}</h1>
          <p v-if="pagina?.atualizadoEm" class="text-xs text-gray-500 mt-2">
            {{ t.updatedAt }} {{ formatDate(pagina.atualizadoEm) }}
          </p>

          <div v-if="conteudoHtml" class="prose prose-gray max-w-none mt-6" v-html="conteudoHtml" />
          <div v-else class="prose prose-gray max-w-none mt-6 whitespace-pre-wrap">
            {{ pagina?.conteudo || '' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const intl = useIntlContext()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      loading: 'Loading...',
      notFound: 'Page not found.',
      updatedAt: 'Updated on'
    }
  }

  if (intl.language.value === 'es') {
    return {
      loading: 'Cargando...',
      notFound: 'Página no encontrada.',
      updatedAt: 'Actualizado el'
    }
  }

  return {
    loading: 'Carregando...',
    notFound: 'Página não encontrada.',
    updatedAt: 'Atualizado em'
  }
})

type PaginaDto = {
  titulo: string
  slug: string
  conteudo: string | null
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; pagina: PaginaDto }>(() => `/api/paginas/${slug.value}`, {
  server: true
})

const pagina = computed(() => data.value?.pagina || null)

const looksLikeHtml = computed(() => {
  const raw = String(pagina.value?.conteudo || '')
  if (!raw.trim()) return false
  return /<\s*[a-z][\s\S]*>/i.test(raw)
})

const conteudoHtml = computed(() => {
  if (!looksLikeHtml.value) return ''
  const raw = String(pagina.value?.conteudo || '')
  return DOMPurify.sanitize(raw)
})

const { siteName } = useSiteBranding()

useHead(() => {
  const title = pagina.value?.titulo ? `${pagina.value.titulo} - ${siteName}` : siteName
  return { title }
})

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleString(intl.locale.value)
  } catch {
    return input
  }
}
</script>
