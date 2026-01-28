<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type CategoriaDto = { id: string; nome: string; slug: string }

const route = useRoute()
const id = String(route.params.id)

const { data, pending, error } = await useFetch(() => `/api/admin/produtos/${id}`)

const form = reactive({
  nome: '',
  slug: '',
  finalUrl: '',
  categorias: [] as string[],
  preco: '',
  precoAntigo: '',
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

const { data: categoriasData } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/admin/categorias', {
  server: false
})

const categorias = computed(() => categoriasData.value?.categorias || [])

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

watchEffect(() => {
  const p: any = data.value
  if (!p) return

  form.nome = p.nome ?? ''
  form.slug = p.slug ?? ''
  form.finalUrl = p.finalUrl ?? ''
  form.preco = String(p.preco ?? '')
  form.precoAntigo = p.precoAntigo === null || p.precoAntigo === undefined ? '' : String(p.precoAntigo)
  form.cardItems = p.cardItems ?? ''
  form.descricao = p.descricao ?? ''
  form.ativo = p.ativo ?? true
  form.imagem = p.imagem ?? ''
  form.categorias = Array.isArray(p.categorias) ? p.categorias.map((c: any) => c?.slug).filter(Boolean) : []
  form.googleAdsConversionLabel = p.googleAdsConversionLabel ?? ''
  form.googleAdsConversionValue = p.googleAdsConversionValue === null || p.googleAdsConversionValue === undefined ? '' : String(p.googleAdsConversionValue)
  form.googleAdsConversionCurrency = p.googleAdsConversionCurrency ?? 'BRL'
  form.tutorialTitulo = p.tutorialTitulo ?? ''
  form.tutorialSubtitulo = p.tutorialSubtitulo ?? ''
  form.tutorialConteudo = p.tutorialConteudo ?? ''
})

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
  await $fetch(`/api/admin/produtos/${id}`, {
    method: 'PUT',
    body: form
  })

  navigateTo('/admin/produtos')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">
        Editar produto
      </h1>

      <NuxtLink
        to="/admin/produtos"
        class="text-blue-600 hover:underline"
      >
        Voltar
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-gray-500">
      Carregando...
    </div>

    <div v-else-if="error || !data" class="text-red-600">
      Produto não encontrado.
    </div>

    <div v-else class="grid grid-cols-3 gap-6">

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
          rows="14"
          class="w-full border p-3 rounded"
        />
      </div>

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
          <label class="text-sm font-medium text-gray-700">Categorias</label>
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

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Imagem</label>

          <input type="file" accept="image/*" @change="uploadImagem" />

          <div v-if="uploadLoading" class="text-xs text-gray-500">Enviando imagem...</div>
          <div v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</div>

          <div v-if="form.imagem" class="text-xs text-gray-500">
            {{ form.imagem }}
          </div>

          <img v-if="form.imagem" :src="form.imagem" class="rounded border" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Google Ads</label>

          <input
            v-model="form.googleAdsConversionLabel"
            placeholder="Conversion Label"
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
          class="w-full bg-blue-600 text-white py-2 rounded"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  </div>
</template>
