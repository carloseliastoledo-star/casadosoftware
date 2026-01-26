<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Clientes</h1>
        <p class="text-sm text-gray-600 mt-1">Lista de clientes (inclui total e pedidos importados do WooCommerce).</p>
      </div>

      <NuxtLink to="/admin/importar-woocommerce" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Importar WooCommerce
      </NuxtLink>
    </div>

    <div class="bg-white rounded shadow p-4 mb-6">
      <label class="block text-sm font-medium mb-2">Pesquisar</label>
      <input
        v-model="q"
        class="w-full border rounded-lg p-3"
        placeholder="Buscar por nome ou e-mail"
      />
      <div class="text-xs text-gray-500 mt-2">Mostrando até 500 resultados.</div>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os clientes.</div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">E-mail</th>
            <th class="p-3 text-left">Nome</th>
            <th class="p-3 text-left">WhatsApp</th>
            <th class="p-3 text-left">Pedidos (Woo)</th>
            <th class="p-3 text-left">Total gasto (Woo)</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in customers" :key="c.id" class="border-t">
            <td class="p-3">
              <div class="font-medium">{{ c.email }}</div>
              <div class="font-mono text-xs text-gray-400">{{ c.id }}</div>
            </td>
            <td class="p-3">{{ c.nome || '-' }}</td>
            <td class="p-3">{{ c.whatsapp || '-' }}</td>
            <td class="p-3">{{ c.wooOrdersCount }}</td>
            <td class="p-3">{{ formatMoney(c.wooTotalSpent) }}</td>
            <td class="p-3">
              <button class="text-blue-600 hover:text-blue-800" @click="openEdit(c)">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showEdit" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeEdit" />

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-xl rounded-xl shadow-lg">
          <div class="flex items-center justify-between p-5 border-b">
            <div>
              <h2 class="text-lg font-semibold">Editar cliente</h2>
              <p class="text-sm text-gray-600 mt-1">{{ edit?.email }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-700" @click="closeEdit">Fechar</button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="block font-medium mb-2">Nome</label>
              <input v-model="form.nome" class="w-full border rounded-lg p-3" />
            </div>

            <div>
              <label class="block font-medium mb-2">WhatsApp</label>
              <input v-model="form.whatsapp" class="w-full border rounded-lg p-3" />
            </div>

            <div>
              <label class="block font-medium mb-2">CPF</label>
              <input v-model="form.cpf" class="w-full border rounded-lg p-3" />
            </div>

            <div v-if="saveMessage" class="text-green-700 text-sm font-medium">{{ saveMessage }}</div>
            <div v-if="saveError" class="text-red-700 text-sm font-medium">{{ saveError }}</div>
          </div>

          <div class="p-5 border-t flex items-center justify-end gap-3">
            <button class="px-4 py-2 rounded-lg border" @click="closeEdit" :disabled="saving">Cancelar</button>
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              @click="save"
              :disabled="saving"
            >
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type CustomerDto = {
  id: string
  email: string
  nome: string | null
  whatsapp: string | null
  cpf: string | null
  wooOrdersCount: number
  wooTotalSpent: number
}

const q = ref('')

const { data, pending, error, refresh } = await useFetch<{ ok: true; customers: CustomerDto[] }>(() => `/api/admin/clientes?q=${encodeURIComponent(q.value.trim())}`, {
  server: false
})

const customers = computed(() => data.value?.customers || [])

let qTimer: any = null
watch(q, () => {
  if (qTimer) clearTimeout(qTimer)
  qTimer = setTimeout(() => {
    refresh()
  }, 250)
})

const showEdit = ref(false)
const edit = ref<CustomerDto | null>(null)
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')

const form = reactive({
  nome: '',
  whatsapp: '',
  cpf: ''
})

function openEdit(c: CustomerDto) {
  edit.value = c
  showEdit.value = true
  saveMessage.value = ''
  saveError.value = ''
  form.nome = c.nome || ''
  form.whatsapp = c.whatsapp || ''
  form.cpf = c.cpf || ''
}

function closeEdit() {
  showEdit.value = false
  edit.value = null
}

async function save() {
  if (!edit.value?.id) return

  saving.value = true
  saveMessage.value = ''
  saveError.value = ''

  try {
    await $fetch(`/api/admin/clientes/${edit.value.id}`, {
      method: 'PUT',
      body: {
        nome: form.nome,
        whatsapp: form.whatsapp,
        cpf: form.cpf
      }
    })

    saveMessage.value = 'Cliente atualizado com sucesso.'
    await refresh()
    closeEdit()
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || 'Erro ao atualizar cliente'
  } finally {
    saving.value = false
  }
}

function formatMoney(n: number) {
  try {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  } catch {
    return String(n)
  }
}
</script>
