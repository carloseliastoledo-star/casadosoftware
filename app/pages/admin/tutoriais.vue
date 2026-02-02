<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type AdminProdutoDto = {
  id: string
  nome?: string | null
  name?: string | null
  slug: string
}

const { data, pending, error, refresh } = await useFetch<AdminProdutoDto[]>('/api/admin/produtos')

const tutoriais = computed(() => {
  const list = Array.isArray(data.value) ? data.value : []
  return list
    .map((p) => ({
      id: String(p.id),
      slug: String(p.slug || '').trim(),
      label: String(p.nome || p.name || p.slug || '').trim()
    }))
    .filter((p) => p.slug)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">Tutoriais</h1>
        <p class="text-sm text-gray-600 mt-1">
          Atalhos para as páginas públicas de tutoriais.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/tutoriais"
          target="_blank"
          class="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Abrir lista pública
        </NuxtLink>

        <button
          type="button"
          class="border border-gray-300 text-gray-800 px-4 py-2 rounded"
          @click="refresh()"
        >
          Atualizar
        </button>
      </div>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os produtos.</div>

    <div v-else class="bg-white rounded shadow overflow-hidden">
      <div v-if="tutoriais.length === 0" class="p-4 text-gray-500">Nenhum tutorial encontrado.</div>

      <ul v-else class="divide-y">
        <li v-for="t in tutoriais" :key="t.id" class="p-4 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="font-semibold text-gray-900 truncate">{{ t.label }}</div>
            <div class="text-xs text-gray-500 mt-1">/tutoriais/{{ t.slug }}</div>
          </div>
          <NuxtLink
            :to="`/tutoriais/${t.slug}`"
            target="_blank"
            class="text-blue-600 font-semibold hover:underline"
          >
            Abrir →
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
