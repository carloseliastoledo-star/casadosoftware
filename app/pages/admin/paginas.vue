<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Páginas</h1>
        <p class="text-sm text-gray-600 mt-1">Crie páginas institucionais e publique no site.</p>
      </div>

      <button
        @click="openCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Nova página
      </button>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar as páginas.</div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Título</th>
            <th class="p-3 text-left">Slug</th>
            <th class="p-3 text-left">Publicado</th>
            <th class="p-3 text-left">Atualizado</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paginas" :key="p.id" class="border-t">
            <td class="p-3 font-medium">{{ p.titulo }}</td>
            <td class="p-3 font-mono text-xs">/paginas/{{ p.slug }}</td>
            <td class="p-3">
              <span
                class="px-2 py-1 rounded text-xs"
                :class="p.publicado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'"
              >
                {{ p.publicado ? 'SIM' : 'NÃO' }}
              </span>
            </td>
            <td class="p-3 text-xs text-gray-600">{{ formatDate(p.atualizadoEm) }}</td>
            <td class="p-3">
              <div class="flex items-center gap-3">
                <button class="text-blue-600 hover:text-blue-800" @click="openEdit(p.id)">Editar</button>
                <button class="text-red-600 hover:text-red-800" @click="deletePagina(p)">Apagar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeModal" />

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-xl shadow-lg max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between p-5 border-b">
            <div>
              <h2 class="text-lg font-semibold">{{ editingId ? 'Editar página' : 'Nova página' }}</h2>
              <p v-if="editingId" class="text-sm text-gray-600 mt-1 font-mono">{{ editingId }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" @click="closeModal">Fechar</button>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto">
            <div>
              <label class="block font-medium mb-2">Título</label>
              <input v-model="formTitulo" type="text" class="w-full border rounded-lg p-3" placeholder="Ex: Política de Privacidade" />
            </div>

            <div>
              <label class="block font-medium mb-2">Slug</label>
              <input v-model="formSlug" type="text" class="w-full border rounded-lg p-3 font-mono" placeholder="ex: politica-de-privacidade" />
              <p class="text-xs text-gray-500 mt-2">A URL ficará: <span class="font-mono">/paginas/{{ formSlug || '...' }}</span></p>
            </div>

            <div>
              <label class="block font-medium mb-2">Conteúdo</label>
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <input id="isHtml" v-model="formIsHtml" type="checkbox" class="h-4 w-4" />
                  <label for="isHtml" class="text-sm">Conteúdo em HTML (colar página inteira)</label>
                </div>
              </div>
              <p v-if="formIsHtml" class="text-xs text-gray-500 mt-2">
                Você pode colar HTML completo aqui. O sistema faz limpeza (sanitização) automaticamente ao salvar.
              </p>
              <textarea
                v-model="formConteudo"
                rows="12"
                class="w-full border rounded-lg p-3 font-mono text-xs"
                :placeholder="formIsHtml ? 'Cole aqui o HTML completo da página...' : 'Digite o conteúdo em texto simples...'"
              />

              <div v-if="formIsHtml" class="mt-4">
                <div class="text-xs font-semibold text-gray-700 mb-2">Pré-visualização</div>
                <div class="border rounded-lg p-4 bg-gray-50">
                  <div class="prose prose-gray max-w-none" v-html="previewHtml" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input id="pub" v-model="formPublicado" type="checkbox" class="h-4 w-4" />
              <label for="pub" class="text-sm">Publicar no site</label>
            </div>

            <div v-if="modalMessage" class="text-green-700 text-sm font-medium">{{ modalMessage }}</div>
            <div v-if="modalError" class="text-red-700 text-sm font-medium">{{ modalError }}</div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3">
            <button class="px-4 py-2 rounded-lg border" @click="closeModal" :disabled="modalLoading">Cancelar</button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              @click="saveModal"
              :disabled="modalLoading"
            >
              {{ modalLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'

definePageMeta({ layout: 'admin' })

type PaginaListItem = {
  id: string
  titulo: string
  slug: string
  publicado: boolean
  criadoEm: string
  atualizadoEm: string
}

type PaginaDetail = {
  id: string
  titulo: string
  slug: string
  conteudo: string | null
  publicado: boolean
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error, refresh } = await useFetch<{ ok: true; paginas: PaginaListItem[] }>('/api/admin/paginas', {
  server: false
})

const paginas = computed(() => data.value?.paginas || [])

const showModal = ref(false)
const editingId = ref<string | null>(null)

const formTitulo = ref('')
const formSlug = ref('')
const formConteudo = ref('')
const formIsHtml = ref(false)
const formPublicado = ref(false)

const modalLoading = ref(false)
const modalMessage = ref('')
const modalError = ref('')

function openCreate() {
  editingId.value = null
  formTitulo.value = ''
  formSlug.value = ''
  formConteudo.value = ''
  formIsHtml.value = false
  formPublicado.value = false
  modalMessage.value = ''
  modalError.value = ''
  showModal.value = true
}

async function openEdit(id: string) {
  editingId.value = id
  modalMessage.value = ''
  modalError.value = ''
  showModal.value = true

  try {
    const res = await $fetch<{ ok: true; pagina: PaginaDetail }>(`/api/admin/paginas/${id}`)
    formTitulo.value = res.pagina.titulo
    formSlug.value = res.pagina.slug
    formConteudo.value = res.pagina.conteudo || ''
    formIsHtml.value = /<\s*[a-z][\s\S]*>/i.test(String(res.pagina.conteudo || ''))
    formPublicado.value = Boolean(res.pagina.publicado)
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || 'Erro ao carregar página'
  }
}

const previewHtml = computed(() => {
  const raw = String(formConteudo.value || '')
  if (!raw.trim()) return ''
  return DOMPurify.sanitize(raw)
})

function closeModal() {
  showModal.value = false
}

async function saveModal() {
  modalLoading.value = true
  modalMessage.value = ''
  modalError.value = ''

  try {
    const payload = {
      titulo: formTitulo.value,
      slug: formSlug.value,
      conteudo: formConteudo.value,
      publicado: formPublicado.value
    }

    if (editingId.value) {
      await $fetch(`/api/admin/paginas/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/admin/paginas', {
        method: 'POST',
        body: payload
      })
    }

    modalMessage.value = 'Página salva com sucesso.'
    await refresh()
    closeModal()
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || 'Erro ao salvar página'
  } finally {
    modalLoading.value = false
  }
}

async function deletePagina(p: PaginaListItem) {
  if (!p?.id) return
  if (!confirm('Tem certeza que deseja apagar esta página?')) return

  try {
    await $fetch(`/api/admin/paginas/${p.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao apagar página')
  }
}

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleString('pt-BR')
  } catch {
    return input
  }
}
</script>
