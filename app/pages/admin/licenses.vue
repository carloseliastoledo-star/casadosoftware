<template>
  <div class="min-h-screen bg-gray-100 p-10">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">

      <h1 class="text-2xl font-bold mb-6">
        Importar Licenças
      </h1>

      <div class="mb-6">
        <label class="block font-medium mb-2">Produto</label>
        <input
          v-model="productId"
          list="products"
          type="text"
          placeholder="ex: windows-11-pro"
          class="w-full border rounded-lg p-3"
        />

        <datalist id="products">
          <option v-for="p in produtos" :key="p.id" :value="p.slug">
            {{ p.nome }}
          </option>
        </datalist>
      </div>

      <div class="mb-6">
        <label class="block font-medium mb-2">Licenças (1 por linha)</label>
        <textarea
          v-model="keys"
          rows="8"
          placeholder="AAAAA-BBBBB-CCCCC-DDDDD"
          class="w-full border rounded-lg p-3 font-mono"
        />
      </div>

      <button
        @click="importLicenses"
        :disabled="loading"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Importando...' : 'Importar Licenças' }}
      </button>

      <p v-if="message" class="mt-6 text-green-600 font-medium">
        {{ message }}
      </p>

      <p v-if="error" class="mt-6 text-red-600 font-medium">
        {{ error }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'admin' })

type ProdutoDto = {
  id: string
  nome: string
  slug: string
  preco: number
}

const { data: produtosData } = await useFetch<ProdutoDto[]>('/api/admin/produtos', {
  server: false
})

const produtos = computed(() => produtosData.value || [])

const productId = ref('')
const keys = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function importLicenses() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const raw = productId.value.trim()

    const match = produtos.value.find((p) => {
      if (p.slug === raw || p.id === raw) return true
      return p.nome?.trim().toLowerCase() === raw.toLowerCase()
    })

    const product_id = match?.slug || raw

    const res = await $fetch('/api/admin/licenses/import', {
      method: 'POST',
      body: {
        product_id,
        keys: keys.value
      }
    })

    message.value = `Licenças importadas com sucesso: ${res.inserted}`
    keys.value = ''
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao importar licenças'
  } finally {
    loading.value = false
  }
}
</script>
