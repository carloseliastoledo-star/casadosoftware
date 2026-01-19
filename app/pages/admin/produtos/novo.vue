<script setup>
definePageMeta({ layout: 'admin' })

const form = reactive({
  nome: '',
  slug: '',
  preco: '',
  descricao: '',
  imagem: ''
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
  await $fetch('/api/admin/produtos', {
    method: 'POST',
    body: form
  })

  navigateTo('/admin/produtos')
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
    </div>

    <!-- SIDEBAR -->
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

      <!-- UPLOAD DE IMAGEM -->
      <div>
        <label class="text-sm font-semibold">Imagem do produto</label>

        <input
          type="file"
          @change="uploadImagem"
          class="w-full text-sm"
        />

        <img
          v-if="form.imagem"
          :src="form.imagem"
          class="mt-2 rounded border"
        />
      </div>

      <button
        @click="salvar"
        class="w-full bg-blue-600 text-white py-2 rounded"
      >
        Publicar
      </button>

    </div>

  </div>
</template>
