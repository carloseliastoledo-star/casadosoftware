<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-5xl mx-auto px-6">
      <h1 class="text-3xl font-bold text-gray-900">Blog</h1>
      <p class="text-sm text-gray-600 mt-2">Novidades e tutoriais.</p>

      <div v-if="pending" class="mt-8 text-sm text-gray-600">Carregando...</div>
      <div v-else-if="error" class="mt-8 text-sm text-red-600">Não foi possível carregar o blog.</div>

      <div v-else class="mt-8">
        <div v-if="!posts.length" class="text-sm text-gray-600">Nenhum post publicado ainda.</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="p in posts"
            :key="p.slug"
            class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition"
          >
            <NuxtLink :to="`/blog/${p.slug}`" class="block">
              <div class="bg-gray-100">
                <img
                  v-if="p.featuredImage"
                  :src="p.featuredImage"
                  :alt="p.titulo"
                  class="w-full h-44 object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-44 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center"
                >
                  <div class="text-center px-4">
                    <div class="mx-auto w-10 h-10 rounded-xl bg-white/70 border border-blue-100 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" class="w-5 h-5 text-blue-700" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2h9l3 3v17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7"/>
                        <path d="M15 2v4a1 1 0 0 0 1 1h4" stroke="currentColor" stroke-width="1.7"/>
                        <path d="M7 12h10M7 16h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div class="mt-2 text-xs font-semibold text-blue-900/80">Guia rápido</div>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div class="text-lg font-bold text-gray-900 leading-snug">
                  {{ p.titulo }}
                </div>
                <div v-if="p.descricao" class="text-sm text-gray-600 mt-3 line-clamp-3">
                  {{ p.descricao }}
                </div>
                <div class="text-xs text-gray-500 mt-4">Atualizado em {{ formatDate(p.atualizadoEm) }}</div>

                <div class="mt-5">
                  <span class="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold px-4 py-2 hover:bg-blue-700 transition">
                    Ler mais
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteName } = useSiteBranding()

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
    const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
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

useSeoMeta(() => {
  if (isCasaDoSoftware.value) {
    const title = 'Tutoriais de Ativação Windows e Office | Casa do Software'
    const description =
      'Aprenda a ativar Windows e Office legalmente com nossos guias passo a passo. Dicas, comparativos e suporte técnico.'

    return {
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description
    }
  }

  const title = `Blog - ${siteName}`
  return { title }
})

type BlogPostListDto = {
  titulo: string
  slug: string
  featuredImage: string | null
  descricao: string
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error } = await useFetch<{ ok: true; posts: BlogPostListDto[] }>('/api/blog', {
  server: true
})

const posts = computed(() => data.value?.posts || [])

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString('pt-BR')
  } catch {
    return input
  }
}
</script>
