<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Blog</h1>
        <p class="text-sm text-gray-600 mt-1">Crie posts e publique no site.</p>
      </div>

      <button
        @click="openCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo post
      </button>
    </div>

    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div class="text-sm font-semibold text-gray-900">Gerar post automaticamente (SEO)</div>
          <div class="text-xs text-gray-600 mt-1">Use uma keyword (1 post) ou várias keywords (1 por linha).</div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Keyword (gerar 1 post)</label>
          <input
            v-model="seoKeyword"
            type="text"
            class="w-full border rounded-lg p-3"
            placeholder="Ex: Como ativar Windows 10"
            :disabled="seoLoading"
          />
          <div class="mt-3 flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="seoLoading || !seoKeyword.trim()"
              @click="generateSeoOne"
            >
              {{ seoLoading ? 'Gerando...' : 'Gerar 1 post' }}
            </button>
            <div v-if="seoLastSlug" class="text-xs text-gray-600">
              Último slug: <span class="font-mono">{{ seoLastSlug }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Keywords (gerar em lote)</label>
          <textarea
            v-model="seoBulkKeywords"
            rows="4"
            class="w-full border rounded-lg p-3 font-mono text-xs"
            placeholder="Uma keyword por linha"
            :disabled="seoLoading"
          />
          <div class="mt-3">
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              :disabled="seoLoading || !seoBulkKeywords.trim()"
              @click="generateSeoBulk"
            >
              {{ seoLoading ? 'Gerando...' : 'Gerar em lote' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-5">
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="seoPublished" type="checkbox" class="h-4 w-4" :disabled="seoLoading" />
          Publicar
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="seoForce" type="checkbox" class="h-4 w-4" :disabled="seoLoading" />
          Forçar (regerar)
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="seoGenerateImage" type="checkbox" class="h-4 w-4" :disabled="seoLoading" />
          Gerar imagem
        </label>
      </div>

      <div v-if="seoError" class="mt-3 text-sm text-red-700 font-medium">{{ seoError }}</div>
      <div v-if="seoResult" class="mt-3 text-xs text-gray-700 font-mono whitespace-pre-wrap">{{ seoResult }}</div>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os posts.</div>

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
          <tr v-for="p in posts" :key="p.id" class="border-t">
            <td class="p-3 font-medium">{{ p.titulo }}</td>
            <td class="p-3 font-mono text-xs">/{{ p.slug }}</td>
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
                <button class="text-red-600 hover:text-red-800" @click="deletePost(p)">Apagar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeModal" />

      <div class="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between p-5 border-b shrink-0">
            <div>
              <h2 class="text-lg font-semibold">{{ editingId ? 'Editar post' : 'Novo post' }}</h2>
              <p v-if="editingId" class="text-sm text-gray-600 mt-1 font-mono">{{ editingId }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" @click="closeModal">Fechar</button>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block font-medium mb-2">Título</label>
              <input v-model="formTitulo" type="text" class="w-full border rounded-lg p-3" placeholder="Ex: Como ativar o Windows" />
            </div>

            <div>
              <label class="block font-medium mb-2">Slug</label>
              <input v-model="formSlug" type="text" class="w-full border rounded-lg p-3 font-mono" placeholder="ex: como-ativar-o-windows" />
              <p class="text-xs text-gray-500 mt-2">A URL ficará: <span class="font-mono">/{{ formSlug || '...' }}</span></p>
            </div>

            <div>
              <label class="block font-medium mb-2">Imagem destacada (URL)</label>
              <input
                v-model="formFeaturedImage"
                type="text"
                class="w-full border rounded-lg p-3 font-mono text-xs"
                placeholder="/blog/windows11.jpg ou https://..."
              />
              <div class="mt-2 flex items-center justify-between gap-3">
                <p class="text-xs text-gray-500">Usada no hero do post e nos cards do blog.</p>
                <button
                  type="button"
                  class="text-xs text-red-600 hover:text-red-800"
                  :disabled="modalLoading"
                  @click="removeFeaturedImage"
                >
                  Remover imagem
                </button>
              </div>
            </div>

            <div>
              <label class="block font-medium mb-2">Conteúdo</label>

              <div class="mb-3">
                <div class="flex flex-col md:flex-row md:items-center gap-3">
                  <select
                    v-model="importPaginaId"
                    class="w-full md:w-auto border rounded-lg p-2 text-sm"
                    :disabled="modalLoading || importLoading"
                  >
                    <option value="">Copiar HTML de uma página...</option>
                    <option v-for="p in paginas" :key="p.id" :value="p.id">
                      {{ p.titulo }} (/paginas/{{ p.slug }})
                    </option>
                  </select>
                  <button
                    type="button"
                    class="px-3 py-2 rounded-lg border text-sm bg-white disabled:opacity-50"
                    :disabled="!importPaginaId || modalLoading || importLoading"
                    @click="importarHtmlPagina"
                  >
                    {{ importLoading ? 'Copiando...' : 'Copiar HTML' }}
                  </button>
                </div>
                <div v-if="importError" class="text-xs text-red-600 mt-2">{{ importError }}</div>
              </div>

              <div v-if="editor" class="border rounded-lg overflow-hidden">
                <div class="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border-b">
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="toggleBold">B</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm italic" @click="toggleItalic">I</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm underline" @click="toggleUnderline">U</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="setHeading(2)">H2</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="setHeading(3)">H3</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="toggleBulletList">Lista</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="toggleOrderedList">1.</button>
                  <button type="button" class="px-2 py-1 rounded border text-sm" @click="setLink">Link</button>

                  <div class="flex-1" />

                  <button
                    type="button"
                    class="px-3 py-1 rounded border text-sm bg-white disabled:opacity-50"
                    :disabled="uploadLoading"
                    @click="toggleHtmlSource"
                  >
                    {{ showHtmlSource ? 'Editor' : 'HTML' }}
                  </button>

                  <input ref="uploadInput" type="file" accept="image/*" class="hidden" @change="uploadImage" />
                  <button
                    type="button"
                    class="px-3 py-1 rounded border text-sm bg-white disabled:opacity-50"
                    :disabled="uploadLoading"
                    @click="triggerUpload"
                  >
                    {{ uploadLoading ? 'Enviando...' : 'Enviar imagem' }}
                  </button>

                  <button
                    type="button"
                    class="px-3 py-1 rounded border text-sm bg-white disabled:opacity-50"
                    :disabled="uploadLoading || !editor || !editor.isActive('image')"
                    @click="removeSelectedImage"
                  >
                    Remover imagem
                  </button>
                </div>

                <div class="p-3 min-h-[240px]">
                  <textarea
                    v-if="showHtmlSource"
                    v-model="formHtml"
                    rows="12"
                    class="w-full border rounded-lg p-3 font-mono text-xs"
                    placeholder="<p>Seu conteúdo aqui...</p>"
                  />
                  <EditorContent v-else :editor="editor" class="prose prose-sm max-w-none" />
                </div>
              </div>

              <textarea
                v-else
                v-model="formHtml"
                rows="12"
                class="w-full border rounded-lg p-3 font-mono text-xs"
                placeholder="<p>Seu conteúdo aqui...</p>"
              />

              <div v-if="uploadError" class="text-xs text-red-600 mt-2">{{ uploadError }}</div>
            </div>

            <div class="flex items-center gap-2">
              <input id="pub" v-model="formPublicado" type="checkbox" class="h-4 w-4" />
              <label for="pub" class="text-sm">Publicar no site</label>
            </div>

            <div v-if="modalMessage" class="text-green-700 text-sm font-medium">{{ modalMessage }}</div>
            <div v-if="modalError" class="text-red-700 text-sm font-medium">{{ modalError }}</div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3 shrink-0">
            <button class="px-4 py-2 rounded-lg border" @click="closeModal" :disabled="modalLoading">Cancelar</button>
            <button
              class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              @click="publishNow"
              :disabled="modalLoading"
            >
              Publicar
            </button>
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
import { computed, ref, watch } from 'vue'
import DOMPurify from 'isomorphic-dompurify'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

definePageMeta({ layout: 'admin' })

type BlogPostListItem = {
  id: string
  titulo: string
  slug: string
  publicado: boolean
  criadoEm: string
  atualizadoEm: string
}

type BlogPostDetail = {
  id: string
  titulo: string
  slug: string
  featuredImage: string | null
  html: string | null
  publicado: boolean
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error, refresh } = await useFetch<{ ok: true; posts: BlogPostListItem[] }>('/api/admin/blog', {
  server: false
})

const posts = computed(() => data.value?.posts || [])

const seoKeyword = ref('')
const seoBulkKeywords = ref('')
const seoPublished = ref(true)
const seoForce = ref(false)
const seoGenerateImage = ref(false)
const seoLoading = ref(false)
const seoError = ref('')
const seoResult = ref('')
const seoLastSlug = ref('')

function normalizeBulkKeywords(input: string): string[] {
  return String(input || '')
    .split(/\r?\n/g)
    .map((k) => String(k || '').trim())
    .filter(Boolean)
}

async function generateSeoOne() {
  const keyword = String(seoKeyword.value || '').trim()
  if (!keyword) return

  seoLoading.value = true
  seoError.value = ''
  seoResult.value = ''
  seoLastSlug.value = ''

  try {
    const res: any = await $fetch('/api/seo/generate-post', {
      method: 'POST',
      body: {
        keyword,
        published: Boolean(seoPublished.value),
        force: Boolean(seoForce.value),
        generateImage: Boolean(seoGenerateImage.value)
      }
    })

    seoLastSlug.value = String(res?.slug || '')
    seoResult.value = JSON.stringify(res, null, 2)
    await refresh()
  } catch (err: any) {
    seoError.value = err?.data?.statusMessage || err?.message || 'Erro ao gerar post'
  } finally {
    seoLoading.value = false
  }
}

async function generateSeoBulk() {
  const keywords = normalizeBulkKeywords(seoBulkKeywords.value)
  if (!keywords.length) return

  seoLoading.value = true
  seoError.value = ''
  seoResult.value = ''
  seoLastSlug.value = ''

  try {
    const res: any = await $fetch('/api/seo/generate-bulk', {
      method: 'POST',
      body: {
        keywords,
        published: Boolean(seoPublished.value),
        force: Boolean(seoForce.value),
        generateImage: Boolean(seoGenerateImage.value)
      }
    })

    seoResult.value = JSON.stringify(res, null, 2)
    await refresh()
  } catch (err: any) {
    seoError.value = err?.data?.statusMessage || err?.message || 'Erro ao gerar posts'
  } finally {
    seoLoading.value = false
  }
}

const showModal = ref(false)
const editingId = ref<string | null>(null)

const formTitulo = ref('')
const formSlug = ref('')
const formFeaturedImage = ref('')
const formHtml = ref('')
const formPublicado = ref(false)

const showHtmlSource = ref(false)

const uploadInput = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const uploadError = ref('')

const lastEditorSelection = ref<{ from: number; to: number } | null>(null)

const editor = process.client
  ? useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: 'noopener',
            target: '_blank'
          }
        }),
        Image,
        Placeholder.configure({ placeholder: 'Cole aqui seu conteúdo...' })
      ],
      content: '',
      editorProps: {
        transformPastedHTML(html) {
          return DOMPurify.sanitize(html, {
            USE_PROFILES: { html: true },
            FORBID_ATTR: ['style', 'class', 'id', 'onerror', 'onclick', 'onload']
          })
        }
      },
      onUpdate({ editor }) {
        formHtml.value = editor.getHTML()
      }
    })
  : ref(null)

function setEditorHtml(html: string) {
  const e: any = (editor as any).value
  if (!e) return
  e.commands.setContent(html || '', false)
}

watch(
  () => showModal.value,
  (open) => {
    if (!open) return
    uploadError.value = ''
    showHtmlSource.value = false
    setEditorHtml(formHtml.value)
  }
)

function toggleHtmlSource() {
  showHtmlSource.value = !showHtmlSource.value
  if (!showHtmlSource.value) {
    setEditorHtml(formHtml.value)
  }
}

const modalLoading = ref(false)
const modalMessage = ref('')
const modalError = ref('')

type PaginaListItem = {
  id: string
  titulo: string
  slug: string
}

type PaginaDetail = {
  id: string
  conteudo: string | null
}

const { data: paginasData } = await useFetch<{ ok: true; paginas: PaginaListItem[] }>('/api/admin/paginas', {
  server: false
})

const paginas = computed(() => paginasData.value?.paginas || [])

const importPaginaId = ref('')
const importLoading = ref(false)
const importError = ref('')

function openCreate() {
  editingId.value = null
  formTitulo.value = ''
  formSlug.value = ''
  formFeaturedImage.value = ''
  formHtml.value = ''
  formPublicado.value = false
  modalMessage.value = ''
  modalError.value = ''
  importPaginaId.value = ''
  importError.value = ''
  showModal.value = true
}

async function openEdit(id: string) {
  editingId.value = id
  modalMessage.value = ''
  modalError.value = ''
  importPaginaId.value = ''
  importError.value = ''
  showModal.value = true

  try {
    const res = await $fetch<{ ok: true; post: BlogPostDetail }>(`/api/admin/blog/${id}`)
    formTitulo.value = res.post.titulo
    formSlug.value = res.post.slug
    formFeaturedImage.value = res.post.featuredImage || ''
    formHtml.value = res.post.html || ''
    formPublicado.value = Boolean(res.post.publicado)
    setEditorHtml(formHtml.value)
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || 'Erro ao carregar post'
  }
}

async function importarHtmlPagina() {
  const id = String(importPaginaId.value || '').trim()
  if (!id) return

  importLoading.value = true
  importError.value = ''

  try {
    const res = await $fetch<{ ok: true; pagina: PaginaDetail }>(`/api/admin/paginas/${id}`)
    const html = String(res?.pagina?.conteudo || '')
    formHtml.value = html
    setEditorHtml(html)
    importError.value = ''
  } catch (err: any) {
    importError.value = err?.data?.statusMessage || 'Erro ao copiar HTML da página'
  } finally {
    importLoading.value = false
  }
}

async function publishNow() {
  formPublicado.value = true
  await saveModal()
}

function closeModal() {
  showModal.value = false
}

async function saveModal() {
  modalLoading.value = true
  modalMessage.value = ''
  modalError.value = ''

  try {
    const featuredImageRaw = String(formFeaturedImage.value || '').trim()
    const featuredImage = featuredImageRaw ? featuredImageRaw : null

    const payload = {
      titulo: formTitulo.value,
      slug: formSlug.value,
      featuredImage,
      html: formHtml.value,
      publicado: formPublicado.value
    }

    if (editingId.value) {
      await $fetch(`/api/admin/blog/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/admin/blog', {
        method: 'POST',
        body: payload
      })
    }

    modalMessage.value = 'Post salvo com sucesso.'
    await refresh()
    closeModal()
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || 'Erro ao salvar post'
  } finally {
    modalLoading.value = false
  }
}

function removeFeaturedImage() {
  formFeaturedImage.value = ''
}

async function deletePost(p: BlogPostListItem) {
  if (!p?.id) return
  if (!confirm('Tem certeza que deseja apagar este post?')) return

  try {
    await $fetch(`/api/admin/blog/${p.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao apagar post')
  }
}

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleString('pt-BR')
  } catch {
    return input
  }
}

async function uploadImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  uploadLoading.value = true
  uploadError.value = ''

  try {
    const form = new FormData()
    form.append('file', file)
    const res: any = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: form
    })

    const url = String(res?.url || '').trim()
    if (!url) return

    const e: any = (editor as any).value
    if (e) {
      const sel = lastEditorSelection.value
      if (sel?.from != null && sel?.to != null) {
        e.chain().focus().setTextSelection(sel).run()
      } else {
        e.chain().focus().run()
      }

      e.chain().setImage({ src: url }).run()
    }
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || err?.message || 'Erro ao enviar imagem'
  } finally {
    uploadLoading.value = false
    if (input) input.value = ''
  }
}

function triggerUpload() {
  const e: any = (editor as any).value
  try {
    const sel = e?.state?.selection
    if (sel?.from != null && sel?.to != null) {
      lastEditorSelection.value = { from: sel.from, to: sel.to }
    } else {
      lastEditorSelection.value = null
    }
  } catch {
    lastEditorSelection.value = null
  }

  uploadInput.value?.click()
}

function removeSelectedImage() {
  const e: any = (editor as any).value
  if (!e) return
  e.chain().focus().deleteNode('image').run()
}

function toggleBold() {
  const e: any = (editor as any).value
  e?.chain().focus().toggleBold().run()
}

function toggleItalic() {
  const e: any = (editor as any).value
  e?.chain().focus().toggleItalic().run()
}

function toggleUnderline() {
  const e: any = (editor as any).value
  e?.chain().focus().toggleUnderline().run()
}

function toggleBulletList() {
  const e: any = (editor as any).value
  e?.chain().focus().toggleBulletList().run()
}

function toggleOrderedList() {
  const e: any = (editor as any).value
  e?.chain().focus().toggleOrderedList().run()
}

function setHeading(level: 2 | 3) {
  const e: any = (editor as any).value
  e?.chain().focus().toggleHeading({ level }).run()
}

function setLink() {
  const e: any = (editor as any).value
  if (!e) return

  const current = e.getAttributes('link')?.href || ''
  const url = window.prompt('URL do link:', current)
  if (url === null) return
  const trimmed = String(url || '').trim()

  if (!trimmed) {
    e.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  e.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
}
</script>
