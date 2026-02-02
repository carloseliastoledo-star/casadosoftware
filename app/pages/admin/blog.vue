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
              <label class="block font-medium mb-2">Conteúdo</label>

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

                  <input ref="uploadInput" type="file" accept="image/*" class="hidden" @change="uploadImage" />
                  <button
                    type="button"
                    class="px-3 py-1 rounded border text-sm bg-white disabled:opacity-50"
                    :disabled="uploadLoading"
                    @click="triggerUpload"
                  >
                    {{ uploadLoading ? 'Enviando...' : 'Enviar imagem' }}
                  </button>
                </div>

                <div class="p-3 min-h-[240px]">
                  <EditorContent :editor="editor" class="prose prose-sm max-w-none" />
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
  html: string | null
  publicado: boolean
  criadoEm: string
  atualizadoEm: string
}

const { data, pending, error, refresh } = await useFetch<{ ok: true; posts: BlogPostListItem[] }>('/api/admin/blog', {
  server: false
})

const posts = computed(() => data.value?.posts || [])

const showModal = ref(false)
const editingId = ref<string | null>(null)

const formTitulo = ref('')
const formSlug = ref('')
const formHtml = ref('')
const formPublicado = ref(false)

const uploadInput = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const uploadError = ref('')

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
    setEditorHtml(formHtml.value)
  }
)

const modalLoading = ref(false)
const modalMessage = ref('')
const modalError = ref('')

function openCreate() {
  editingId.value = null
  formTitulo.value = ''
  formSlug.value = ''
  formHtml.value = ''
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
    const res = await $fetch<{ ok: true; post: BlogPostDetail }>(`/api/admin/blog/${id}`)
    formTitulo.value = res.post.titulo
    formSlug.value = res.post.slug
    formHtml.value = res.post.html || ''
    formPublicado.value = Boolean(res.post.publicado)
    setEditorHtml(formHtml.value)
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || 'Erro ao carregar post'
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
    const payload = {
      titulo: formTitulo.value,
      slug: formSlug.value,
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
    e?.chain().focus().setImage({ src: url }).run()
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || err?.message || 'Erro ao enviar imagem'
  } finally {
    uploadLoading.value = false
    if (input) input.value = ''
  }
}

function triggerUpload() {
  uploadInput.value?.click()
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
