<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Atendimentos</h1>
        <p class="text-sm text-gray-600 mt-1">Gerencie as conversas de chat do site.</p>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="statusFilter" class="w-full border rounded-lg p-3">
            <option value="">Todos</option>
            <option value="AI">IA</option>
            <option value="HUMAN">Humano</option>
            <option value="CLOSED">Encerrados</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-2">Pesquisar</label>
          <input
            v-model="searchQuery"
            class="w-full border rounded-lg p-3"
            placeholder="Nome, e-mail ou pedido"
          />
        </div>
      </div>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os atendimentos.</div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">Cliente</th>
            <th class="p-3 text-left">E-mail</th>
            <th class="p-3 text-left">Pedido</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Última mensagem</th>
            <th class="p-3 text-left">Atualizado</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="conv in conversations" :key="conv.id" class="border-t">
            <td class="p-3 font-medium">{{ conv.customerName }}</td>
            <td class="p-3">{{ conv.customerEmail || '-' }}</td>
            <td class="p-3">{{ conv.orderNumber || '-' }}</td>
            <td class="p-3">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  conv.status === 'AI' ? 'bg-blue-100 text-blue-700' :
                  conv.status === 'HUMAN' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ conv.status === 'AI' ? 'IA' : conv.status === 'HUMAN' ? 'Humano' : 'Encerrado' }}
              </span>
            </td>
            <td class="p-3 text-gray-600 max-w-xs truncate">{{ conv.lastMessage || '-' }}</td>
            <td class="p-3 text-gray-500">{{ formatDateTime(conv.updatedAt) }}</td>
            <td class="p-3">
              <button @click="openConversation(conv.id)" class="text-blue-600 hover:text-blue-800">
                Abrir
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="conversations.length === 0" class="p-8 text-center text-gray-500">
        Nenhum atendimento encontrado.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const statusFilter = ref('')
const searchQuery = ref('')
const pending = ref(false)
const error = ref(false)
const conversations = ref<any[]>([])

const pollingInterval = ref<any>(null)

onMounted(() => {
  loadConversations()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

watch([statusFilter, searchQuery], () => {
  loadConversations()
})

async function loadConversations() {
  pending.value = true
  error.value = false

  try {
    const query: any = {}
    if (statusFilter.value) query.status = statusFilter.value
    if (searchQuery.value) query.search = searchQuery.value

    const response = await $fetch('/api/admin/chat/conversations', {
      query
    }) as any

    conversations.value = response.conversations || []
  } catch (err) {
    console.error('[atendimentos] Error loading conversations:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    loadConversations()
  }, 8000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function openConversation(id: string) {
  console.log('[atendimentos] Opening conversation:', id)
  try {
    navigateTo(`/admin/atendimentos/${id}`)
  } catch (e) {
    console.error('[atendimentos] Navigation error:', e)
  }
}
</script>
