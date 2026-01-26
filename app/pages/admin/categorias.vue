<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Categorias</h1>
        <p class="text-sm text-gray-600 mt-1">Gerencie as categorias usadas nas URLs /categoria/[slug].</p>
      </div>
    </div>

    <div class="bg-white rounded shadow p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <input v-model="newNome" class="w-full border p-2 rounded" placeholder="Office" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Slug</label>
          <input v-model="newSlug" class="w-full border p-2 rounded" placeholder="office" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading"
          @click="createCategoria"
        >
          Criar
        </button>
        <button class="px-4 py-2 rounded-lg border" :disabled="loading" @click="seedPadrao">
          Criar categorias padrão
        </button>
        <button class="px-4 py-2 rounded-lg border" :disabled="loading" @click="refresh">Atualizar</button>
      </div>

      <div v-if="message" class="text-green-700 text-sm font-medium">{{ message }}</div>
      <div v-if="error" class="text-red-700 text-sm font-medium">{{ error }}</div>
    </div>

    <div class="mt-6 bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Nome</th>
            <th class="p-3 text-left">Slug</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in categorias" :key="c.id" class="border-t">
            <td class="p-3">
              <input v-model="c.nome" class="w-full border p-2 rounded" />
            </td>
            <td class="p-3">
              <input v-model="c.slug" class="w-full border p-2 rounded font-mono" />
            </td>
            <td class="p-3">
              <div class="flex items-center gap-3">
                <button class="text-blue-600 hover:text-blue-800" @click="save(c)">Salvar</button>
                <button class="text-red-600 hover:text-red-800" @click="remove(c)">Apagar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type CategoriaDto = { id: string; nome: string; slug: string }

const loading = ref(false)
const error = ref('')
const message = ref('')

const newNome = ref('')
const newSlug = ref('')

const { data, refresh } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/admin/categorias', {
  server: false
})

const categorias = ref<CategoriaDto[]>([])

watchEffect(() => {
  const list = data.value?.categorias || []
  categorias.value = list.map((c) => ({ ...c }))
})

async function createCategoria() {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    await $fetch('/api/admin/categorias', {
      method: 'POST',
      body: { nome: newNome.value, slug: newSlug.value }
    })
    newNome.value = ''
    newSlug.value = ''
    await refresh()
    message.value = 'Categoria criada.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar categoria'
  } finally {
    loading.value = false
  }
}

async function save(c: CategoriaDto) {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    await $fetch(`/api/admin/categorias/${c.id}`, {
      method: 'PUT',
      body: { nome: c.nome, slug: c.slug }
    })
    await refresh()
    message.value = 'Categoria salva.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao salvar categoria'
  } finally {
    loading.value = false
  }
}

async function remove(c: CategoriaDto) {
  if (!confirm('Apagar esta categoria?')) return

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    await $fetch(`/api/admin/categorias/${c.id}`, { method: 'DELETE' })
    await refresh()
    message.value = 'Categoria apagada.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao apagar categoria'
  } finally {
    loading.value = false
  }
}

async function seedPadrao() {
  if (!confirm('Criar/atualizar as categorias padrão?')) return

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    await $fetch('/api/admin/categorias/seed', { method: 'POST' })
    await refresh()
    message.value = 'Categorias padrão criadas.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao criar categorias padrão'
  } finally {
    loading.value = false
  }
}
</script>
