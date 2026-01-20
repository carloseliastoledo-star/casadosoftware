<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { data, pending, error } = await useFetch(() => `/api/admin/produtos/${id}`)

const form = reactive({
  nome: '',
  slug: '',
  preco: '',
  descricao: '',
  imagem: '',
  tutorialTitulo: '',
  tutorialSubtitulo: '',
  tutorialConteudo: ''
})

watchEffect(() => {
  const p: any = data.value
  if (!p) return

  form.nome = p.nome ?? ''
  form.slug = p.slug ?? ''
  form.preco = String(p.preco ?? '')
  form.descricao = p.descricao ?? ''
  form.imagem = p.imagem ?? ''
  form.tutorialTitulo = p.tutorialTitulo ?? ''
  form.tutorialSubtitulo = p.tutorialSubtitulo ?? ''
  form.tutorialConteudo = p.tutorialConteudo ?? ''
})

async function uploadImagem(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  const res = await $fetch('/api/admin/upload', {
    method: 'POST',
    body: formData
  })

  form.imagem = res.url
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
          v-model="form.preco"
          placeholder="Preço"
          class="w-full border p-2 rounded"
        />

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Imagem</label>

          <input type="file" @change="uploadImagem" />

          <div v-if="form.imagem" class="text-xs text-gray-500">
            {{ form.imagem }}
          </div>
        </div>

        <button
          @click="salvar"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Salvar alterações
        </button>
      </div>
    </div>
  </div>
</template>
