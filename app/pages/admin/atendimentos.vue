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
                  'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                  conv.status === 'AI' ? 'bg-blue-100 text-blue-700' :
                  conv.status === 'HUMAN' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                <span v-if="conv.status === 'HUMAN'" class="text-lg">👤</span>
                <span v-else-if="conv.status === 'AI'" class="text-lg">🤖</span>
                <span v-else class="text-lg">🔒</span>
                {{ conv.status === 'AI' ? 'IA' : conv.status === 'HUMAN' ? 'Humano' : 'Encerrado' }}
              </span>
            </td>
            <td class="p-3 text-gray-600 max-w-xs truncate">{{ conv.lastMessage || '-' }}</td>
            <td class="p-3 text-gray-500">{{ formatDateTime(conv.updatedAt) }}</td>
            <td class="p-3">
              <a :href="`/admin/atendimento-detalhes?id=${conv.id}`" class="text-blue-600 hover:text-blue-800">
                Abrir
              </a>
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
const lastConversationCount = ref(0)
const lastMessageTimestamps = ref<Record<string, string>>({})
const conversationStatuses = ref<Record<string, string>>({})

const pollingInterval = ref<any>(null)

onMounted(() => {
  requestNotificationPermission()
  loadConversations()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

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

    const newConversations = response.conversations || []
    
    // Verificar se há novos atendimentos
    if (newConversations.length > lastConversationCount.value && lastConversationCount.value > 0) {
      const newCount = newConversations.length - lastConversationCount.value
      showNotification(`${newCount} novo${newCount > 1 ? 's' : ''} atendimento${newCount > 1 ? 's' : ''} recebido${newCount > 1 ? 's' : ''}`)
      playNotificationSound()
    }

    // Verificar se há novas mensagens em conversas existentes
    for (const conv of newConversations) {
      const lastTimestamp = lastMessageTimestamps.value[conv.id]
      if (lastTimestamp && conv.updatedAt > lastTimestamp) {
        // Verificar se a última atualização foi causada por uma mensagem do cliente
        const lastMessage = conv.lastMessage || ''
        if (lastMessage && conv.status !== 'CLOSED') {
          showNotification(`Nova mensagem de ${conv.customerName || 'cliente'}`)
          playNotificationSound()
        }
      }
      lastMessageTimestamps.value[conv.id] = conv.updatedAt

      // Verificar se o status mudou de AI para HUMAN (cliente solicitou atendimento humano)
      const previousStatus = conversationStatuses.value[conv.id]
      if (previousStatus === 'AI' && conv.status === 'HUMAN') {
        showNotification(`${conv.customerName || 'Cliente'} solicitou atendimento humano`)
        playNotificationSound()
      }
      conversationStatuses.value[conv.id] = conv.status
    }

    conversations.value = newConversations
    lastConversationCount.value = newConversations.length
  } catch (err) {
    console.error('[atendimentos] Error loading conversations:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

function showNotification(message: string) {
  console.log('[atendimentos] Tentando mostrar notificação:', message)
  console.log('[atendimentos] Notification permission:', Notification.permission)
  
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      console.log('[atendimentos] Permissão concedida, criando notificação')
      new Notification('Novo Atendimento - Casa do Software', {
        body: message,
        icon: '/favicon.ico'
      })
    } else if (Notification.permission === 'default') {
      console.log('[atendimentos] Permissão não solicitada, solicitando agora')
      Notification.requestPermission().then(permission => {
        console.log('[atendimentos] Permissão resultante:', permission)
        if (permission === 'granted') {
          new Notification('Novo Atendimento - Casa do Software', {
            body: message,
            icon: '/favicon.ico'
          })
        }
      })
    } else {
      console.log('[atendimentos] Permissão negada:', Notification.permission)
    }
  } else {
    console.log('[atendimentos] Notificações não suportadas neste navegador')
  }
}

function playNotificationSound() {
  // Som opcional - não bloqueia notificação se arquivo não existir
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
</script>
