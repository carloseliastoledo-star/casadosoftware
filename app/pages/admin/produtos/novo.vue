<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type CategoriaDto = { id: string; nome: string; slug: string }

const form = reactive({
  nome: '',
  slug: '',
  finalUrl: '',
  categorias: [] as string[],
  preco: '',
  precoAntigo: '',
  precoUsd: '',
  precoEur: '',
  cardItems: '',
  descricao: '',
  ativo: true,
  imagem: '',
  googleAdsConversionLabel: '',
  googleAdsConversionValue: '',
  googleAdsConversionCurrency: 'BRL',
  tutorialTitulo: '',
  tutorialSubtitulo: '',
  tutorialConteudo: ''
})

const uploadLoading = ref(false)
const uploadError = ref('')

const saving = ref(false)
const saveError = ref('')

const microsoft365Text =
  'Microsoft 365/Office 365 (assinatura anual):\n' +
  '- Entrega por conta fornecida (login e senha) após a confirmação do pagamento.\n' +
  '- Validade de 12 meses (assinatura anual), conforme descrito no produto.\n' +
  '- O acesso é feito com a conta fornecida (não é ativação em uma conta Microsoft pessoal já existente).'

const isMicrosoft365Candidate = computed(() => {
  const nome = String(form.nome || '').toLowerCase()
  const slug = String(form.slug || '').toLowerCase()
  return (
    nome.includes('microsoft 365') ||
    nome.includes('office 365') ||
    slug.includes('microsoft-365') ||
    slug.includes('office-365') ||
    slug.includes('365')
  )
})

function inserirTextoMicrosoft365() {
  const current = String(form.descricao || '').trim()
  if (current.toLowerCase().includes('conta fornecida')) return
  form.descricao = current ? `${current}\n\n${microsoft365Text}` : microsoft365Text
}

const { data: categoriasData } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/admin/categorias', {
  server: false
})

const categorias = computed(() => categoriasData.value?.categorias || [])

async function uploadImagem(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  uploadLoading.value = true
  uploadError.value = ''

  try {
    const res = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })

    form.imagem = res.url
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || err?.message || 'Erro ao enviar imagem'
  } finally {
    uploadLoading.value = false
  }
}

async function salvar() {
  saveError.value = ''

  if (!form.nome || !form.slug || !form.preco) {
    saveError.value = 'Preencha nome, slug e preço'
    return
  }

  saving.value = true
  try {
    await $fetch('/api/admin/produtos', {
      method: 'POST',
      body: form
    })

    navigateTo('/admin/produtos')
  } catch (err: any) {
    const status = err?.status || err?.response?.status || err?.data?.statusCode
    if (status === 401) {
      await navigateTo('/admin/login')
      return
    }
    saveError.value = err?.data?.statusMessage || err?.message || 'Não foi possível publicar'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="grid grid-cols-3 gap-6">

    <!-- CONTEÚDO -->
    <div class="col-span-2 bg-white p-6 rounded shadow space-y-4">

      <input
        v-model="form.nome"
        placeholder="Nome do produto"
        class="w-full text-2xl border p-3 rounded"
      />

      <textarea
        v-model="form.descricao"
        placeholder="Descrição completa"
        rows="10"
        class="w-full border p-3 rounded"
      />

      <button
        v-if="isMicrosoft365Candidate"
        type="button"
        @click="inserirTextoMicrosoft365"
        class="w-fit border border-gray-300 text-gray-800 px-3 py-2 rounded"
      >
        Inserir texto Microsoft 365
      </button>

      <input
        v-model="form.tutorialTitulo"
        placeholder="Título do tutorial (ex: Tutorial de Ativação)"
        class="w-full border p-3 rounded"
      />

      <input
        v-model="form.tutorialSubtitulo"
        placeholder="Subtítulo do tutorial"
        class="w-full border p-3 rounded"
      />

      <textarea
        v-model="form.tutorialConteudo"
        placeholder="Conteúdo do tutorial (passo a passo)"
        rows="10"
        class="w-full border p-3 rounded"
      />
    </div>

    <!-- SIDEBAR -->
    <div class="bg-white p-6 rounded shadow space-y-4">

      <input
        v-model="form.slug"
        placeholder="Slug (ex: windows-11-pro)"
        class="w-full border p-2 rounded"
      />

      <input
        v-model="form.finalUrl"
        placeholder="URL final (opcional)"
        class="w-full border p-2 rounded"
      />

      <input
        v-model="form.preco"
        placeholder="Preço"
        class="w-full border p-2 rounded"
      />

      <input
        v-model="form.precoUsd"
        placeholder="Preço USD (opcional)"
        class="w-full border p-2 rounded"
      />

      <input
        v-model="form.precoEur"
        placeholder="Preço EUR (opcional)"
        class="w-full border p-2 rounded"
      />

      <input
        v-model="form.precoAntigo"
        placeholder="Preço âncora (opcional)"
        class="w-full border p-2 rounded"
      />

      <div class="space-y-2">
        <label class="text-sm font-semibold">Itens do card (opcional)</label>
        <textarea
          v-model="form.cardItems"
          placeholder="1 item por linha (ex: Envio imediato após confirmação)"
          rows="8"
          class="w-full border p-2 rounded text-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold">Categorias</label>
        <div class="space-y-1">
          <label v-for="c in categorias" :key="c.id" class="flex items-center gap-2 text-sm">
            <input v-model="form.categorias" type="checkbox" class="rounded" :value="c.slug" />
            <span class="font-mono text-xs">{{ c.slug }}</span>
            <span>{{ c.nome }}</span>
          </label>
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input v-model="form.ativo" type="checkbox" class="rounded" />
        Ativo (aparece no site)
      </label>

      <!-- UPLOAD DE IMAGEM -->
      <div>
        <label class="text-sm font-semibold">Imagem do produto</label>

        <input
          type="file"
          @change="uploadImagem"
          class="w-full text-sm"
          accept="image/*"
        />

        <div v-if="uploadLoading" class="text-xs text-gray-500 mt-2">Enviando imagem...</div>
        <div v-if="uploadError" class="text-xs text-red-600 mt-2">{{ uploadError }}</div>

        <img
          v-if="form.imagem"
          :src="form.imagem"
          class="mt-2 rounded border"
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold">Google Ads</label>

        <input
          v-model="form.googleAdsConversionLabel"
          placeholder="Conversion Label (ex: AbCdEfGhIjkLmNoPqRsT)"
          class="w-full border p-2 rounded"
        />

        <input
          v-model="form.googleAdsConversionValue"
          placeholder="Conversion Value (opcional)"
          class="w-full border p-2 rounded"
        />

        <input
          v-model="form.googleAdsConversionCurrency"
          placeholder="Currency (ex: BRL)"
          class="w-full border p-2 rounded"
        />
      </div>

      <button
        @click="salvar"
        :disabled="saving"
        class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
      >
        {{ saving ? 'Publicando...' : 'Publicar' }}
      </button>

      <div v-if="saveError" class="text-xs text-red-600">{{ saveError }}</div>

    </div>

  </div>
</template>
