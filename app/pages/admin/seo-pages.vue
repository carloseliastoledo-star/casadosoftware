<script setup>
definePageMeta({ layout: 'admin', ssr: false })

// ─── State ───────────────────────────────────────────────────────────────────
const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

const filterLocale  = ref('')
const filterStatus  = ref('')
const filterSearch  = ref('')

const { data: listData, pending: listPending, error: listError, refresh } = useFetch(
  '/api/admin/seo-pages',
  {
    headers,
    query: computed(() => ({
      locale: filterLocale.value || undefined,
      status: filterStatus.value || undefined,
      search: filterSearch.value || undefined
    }))
  }
)

const pages = computed(() => listData.value?.pages ?? [])

// ─── Modal / Editor state ─────────────────────────────────────────────────────
const showEditor = ref(false)
const isSaving   = ref(false)
const saveError  = ref('')

const emptyForm = () => ({
  id: '',
  locale: 'pt',
  slug: '',
  title: '',
  seoTitle: '',
  seoDescription: '',
  h1: '',
  heroBadge: '',
  heroDescription: '',
  contentHtml: '',
  faqJson: '',
  linkedProductSlug: '',
  linkedCategorySlug: '',
  templateKey: 'default-money-page',
  status: 'draft',
  noindex: false
})

const form = ref(emptyForm())
const isEdit = computed(() => Boolean(form.value.id))

// Auto-generate slug from title (only on create)
watch(() => form.value.title, (val) => {
  if (isEdit.value) return
  form.value.slug = val
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
})

const previewUrl = computed(() => {
  if (!form.value.slug) return ''
  const base = form.value.locale === 'en' ? 'https://casadosoftware.store' : 'https://casadosoftware.com.br'
  return `${base}/lp/${form.value.slug}`
})

const seoTitleLen  = computed(() => (form.value.seoTitle || '').length)
const seoDescLen   = computed(() => (form.value.seoDescription || '').length)

// Parsed FAQ for editor
const faqItems = ref([{ q: '', a: '' }])

function syncFaqToForm() {
  const valid = faqItems.value.filter(f => f.q.trim() || f.a.trim())
  form.value.faqJson = valid.length ? JSON.stringify(valid) : ''
}

function addFaqRow() { faqItems.value.push({ q: '', a: '' }) }
function removeFaqRow(i) { faqItems.value.splice(i, 1) }

// ─── Open create ─────────────────────────────────────────────────────────────
function openCreate() {
  form.value = emptyForm()
  faqItems.value = [{ q: '', a: '' }]
  saveError.value = ''
  showEditor.value = true
}

// ─── Open edit ────────────────────────────────────────────────────────────────
async function openEdit(id) {
  saveError.value = ''
  const res = await $fetch(`/api/admin/seo-pages/${id}`, { headers }).catch(e => { alert(e?.data?.statusMessage || e?.statusMessage || 'Erro ao carregar página'); return null })
  if (!res) return
  const p = res?.page
  form.value = {
    id: p.id,
    locale: p.locale,
    slug: p.slug,
    title: p.title,
    seoTitle: p.seoTitle ?? '',
    seoDescription: p.seoDescription ?? '',
    h1: p.h1 ?? '',
    heroBadge: p.heroBadge ?? '',
    heroDescription: p.heroDescription ?? '',
    contentHtml: p.contentHtml ?? '',
    faqJson: p.faqJson ?? '',
    linkedProductSlug: p.linkedProductSlug ?? '',
    linkedCategorySlug: p.linkedCategorySlug ?? '',
    templateKey: p.templateKey ?? 'default-money-page',
    status: p.status,
    noindex: p.noindex
  }
  try {
    faqItems.value = p.faqJson ? JSON.parse(p.faqJson) : [{ q: '', a: '' }]
  } catch { faqItems.value = [{ q: '', a: '' }] }
  if (!faqItems.value.length) faqItems.value = [{ q: '', a: '' }]
  showEditor.value = true
}

// ─── Duplicate ────────────────────────────────────────────────────────────────
async function duplicatePage(p) {
  const newSlug = p.slug + '-copy'
  await $fetch('/api/admin/seo-pages', {
    method: 'POST',
    headers,
    body: { ...p, slug: newSlug, status: 'draft', title: p.title + ' (cópia)', id: undefined }
  })
  refresh()
}

// ─── Save (create or update) ─────────────────────────────────────────────────
async function save(targetStatus) {
  syncFaqToForm()
  saveError.value = ''
  isSaving.value = true
  try {
    const body = { ...form.value, status: targetStatus ?? form.value.status }
    if (isEdit.value) {
      await $fetch(`/api/admin/seo-pages/${form.value.id}`, { method: 'PUT', headers, body })
    } else {
      await $fetch('/api/admin/seo-pages', { method: 'POST', headers, body })
    }
    showEditor.value = false
    refresh()
  } catch (e) {
    saveError.value = e?.data?.statusMessage || e?.data?.message || e?.statusMessage || String(e?.message || 'Erro ao salvar')
  } finally {
    isSaving.value = false
  }
}

// ─── Quick toggle publish ─────────────────────────────────────────────────────
async function togglePublish(p) {
  const newStatus = p.status === 'published' ? 'draft' : 'published'
  const res = await $fetch(`/api/admin/seo-pages/${p.id}`, {
    method: 'PUT',
    headers,
    body: { ...p, status: newStatus }
  }).catch(e => { alert(e?.data?.message || 'Erro ao alterar status') })
  if (res) refresh()
}

// ─── Delete ───────────────────────────────────────────────────────────────────
async function deletePage(p) {
  if (!confirm(`Apagar "${p.title}"? Esta ação não pode ser desfeita.`)) return
  await $fetch(`/api/admin/seo-pages/${p.id}`, { method: 'DELETE', headers })
  refresh()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const publicBase = (locale) =>
  locale === 'en' ? 'https://casadosoftware.store' : 'https://casadosoftware.com.br'
</script>

<template>
  <div>

    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">SEO Pages</h1>
        <p class="text-sm text-gray-500 mt-1">Landing pages e money pages gerenciáveis pelo admin.</p>
      </div>
      <button
        @click="openCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
      >
        + Nova página
      </button>
    </div>

    <!-- FILTERS -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input
        v-model="filterSearch"
        type="text"
        placeholder="Buscar por título..."
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52"
      />
      <select v-model="filterLocale" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">Todos os locales</option>
        <option value="pt">🇧🇷 PT</option>
        <option value="en">🇺🇸 EN</option>
      </select>
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">Todos os status</option>
        <option value="published">Publicado</option>
        <option value="draft">Rascunho</option>
      </select>
      <button @click="refresh" class="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
        🔄 Atualizar
      </button>
    </div>

    <!-- TABLE -->
    <div v-if="listPending" class="text-gray-400 py-6">Carregando...</div>
    <div v-else-if="listError" class="text-red-500 py-4">Erro ao carregar páginas.</div>
    <div v-else class="bg-white rounded-xl shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 border-b">
          <tr>
            <th class="p-3 text-left">Título</th>
            <th class="p-3 text-left">Slug / URL</th>
            <th class="p-3 text-left">Locale</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Atualizado</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pages.length">
            <td colspan="6" class="p-6 text-center text-gray-400">
              Nenhuma página encontrada. <button class="text-blue-600 hover:underline" @click="openCreate">Criar a primeira</button>
            </td>
          </tr>
          <tr v-for="p in pages" :key="p.id" class="border-t hover:bg-gray-50 transition">
            <td class="p-3 font-medium max-w-xs">
              <div class="truncate">{{ p.title }}</div>
              <div class="text-xs text-gray-400">{{ p.templateKey }}</div>
            </td>
            <td class="p-3">
              <div class="font-mono text-xs text-gray-600">/lp/{{ p.slug }}</div>
            </td>
            <td class="p-3">
              <span class="text-xs font-semibold px-2 py-1 rounded-full"
                :class="p.locale === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                {{ p.locale === 'en' ? '🇺🇸 EN' : '🇧🇷 PT' }}
              </span>
            </td>
            <td class="p-3">
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full cursor-pointer"
                :class="p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                @click="togglePublish(p)"
                :title="p.status === 'published' ? 'Clique para despublicar' : 'Clique para publicar'"
              >
                {{ p.status === 'published' ? '✅ Publicado' : '📝 Rascunho' }}
              </span>
            </td>
            <td class="p-3 text-xs text-gray-400">{{ formatDate(p.updatedAt) }}</td>
            <td class="p-3">
              <div class="flex items-center gap-2 flex-wrap">
                <button class="text-blue-600 hover:text-blue-800 text-xs" @click="openEdit(p.id)">Editar</button>
                <button class="text-indigo-600 hover:text-indigo-800 text-xs" @click="duplicatePage(p)">Duplicar</button>
                <a
                  :href="`${publicBase(p.locale)}/lp/${p.slug}`"
                  target="_blank"
                  class="text-gray-500 hover:text-gray-700 text-xs"
                >
                  Abrir ↗
                </a>
                <button class="text-red-500 hover:text-red-700 text-xs" @click="deletePage(p)">Apagar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- EDITOR MODAL -->
    <Teleport to="body">
      <div v-if="showEditor" class="fixed inset-0 z-50 flex">

        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="showEditor = false" />

        <!-- Panel -->
        <div class="relative ml-auto h-full w-full max-w-3xl bg-white shadow-2xl flex flex-col overflow-hidden">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h2 class="font-bold text-lg">
              {{ isEdit ? 'Editar SEO Page' : 'Nova SEO Page' }}
            </h2>
            <button @click="showEditor = false" class="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            <!-- Error -->
            <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {{ saveError }}
            </div>

            <!-- URL preview -->
            <div v-if="form.slug" class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
              <span class="text-blue-400 font-mono">URL → </span>
              <span class="text-blue-700 font-mono font-medium">{{ previewUrl }}</span>
            </div>

            <!-- Row: locale + status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Locale *</label>
                <select v-model="form.locale" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="pt">🇧🇷 PT — casadosoftware.com.br</option>
                  <option value="en">🇺🇸 EN — casadosoftware.store</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Template</label>
                <select v-model="form.templateKey" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="default-money-page">default-money-page</option>
                  <option value="comparison-page">comparison-page</option>
                  <option value="activation-page">activation-page</option>
                </select>
              </div>
            </div>

            <!-- Título interno -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Título interno *</label>
              <input v-model="form.title" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Ex: Buy Office 365 EN" />
            </div>

            <!-- Slug -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Slug * <span class="text-gray-400 font-normal">(ex: buy-office-365)</span></label>
              <div class="flex items-center gap-2">
                <span class="text-gray-400 text-sm">/lp/</span>
                <input v-model="form.slug" type="text" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="buy-office-365" />
              </div>
            </div>

            <!-- SEO Title -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                SEO Title
                <span :class="seoTitleLen > 60 ? 'text-red-500' : 'text-gray-400'" class="font-normal ml-1">
                  {{ seoTitleLen }}/60
                </span>
              </label>
              <input v-model="form.seoTitle" type="text" maxlength="80"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Para SERP — deixe vazio para usar o título interno" />
            </div>

            <!-- SEO Description -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                SEO Description
                <span :class="seoDescLen > 160 ? 'text-red-500' : 'text-gray-400'" class="font-normal ml-1">
                  {{ seoDescLen }}/160
                </span>
              </label>
              <textarea v-model="form.seoDescription" rows="2" maxlength="320"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Descrição para Google e redes sociais" />
            </div>

            <!-- H1 + Badge -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">H1 (headline principal)</label>
                <input v-model="form.h1" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Buy Office 365 — Genuine Key" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Hero Badge</label>
                <input v-model="form.heroBadge" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Best Price 2025" />
              </div>
            </div>

            <!-- Hero description -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Hero Description</label>
              <textarea v-model="form.heroDescription" rows="2"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Subtítulo exibido abaixo do H1 no hero" />
            </div>

            <!-- Product / Category link -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Produto vinculado (slug)</label>
                <input v-model="form.linkedProductSlug" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="microsoft-office-2021" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Categoria vinculada (slug)</label>
                <input v-model="form.linkedCategorySlug" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="office" />
              </div>
            </div>

            <!-- Content HTML -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Conteúdo principal (HTML)</label>
              <textarea v-model="form.contentHtml" rows="8"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y"
                placeholder="<p>Conteúdo SEO rico sobre o produto...</p>" />
            </div>

            <!-- FAQ editor -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-gray-600">FAQ</label>
                <button type="button" @click="addFaqRow" class="text-xs text-blue-600 hover:text-blue-800">+ Adicionar item</button>
              </div>
              <div class="space-y-3">
                <div v-for="(item, i) in faqItems" :key="i" class="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 w-4">Q{{ i + 1 }}</span>
                    <input v-model="item.q" type="text"
                      class="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm"
                      placeholder="Pergunta" />
                    <button type="button" @click="removeFaqRow(i)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-xs text-gray-400 w-4 mt-1.5">A</span>
                    <textarea v-model="item.a" rows="2"
                      class="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm resize-none"
                      placeholder="Resposta" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Noindex -->
            <div class="flex items-center gap-2">
              <input v-model="form.noindex" type="checkbox" id="noindex" class="w-4 h-4" />
              <label for="noindex" class="text-sm text-gray-700">Forçar noindex (mesmo se publicado)</label>
            </div>

          </div>

          <!-- Modal footer with action buttons -->
          <div class="border-t px-6 py-4 bg-gray-50 flex items-center gap-3">
            <button
              @click="save('draft')"
              :disabled="isSaving"
              class="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              💾 Salvar rascunho
            </button>
            <button
              @click="save('published')"
              :disabled="isSaving"
              class="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              🚀 Publicar
            </button>
            <a
              v-if="isEdit && form.slug"
              :href="previewUrl"
              target="_blank"
              class="text-sm text-blue-600 hover:underline ml-auto"
            >
              Ver página ↗
            </a>
            <span v-if="isSaving" class="text-sm text-gray-400 ml-auto">Salvando...</span>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>
