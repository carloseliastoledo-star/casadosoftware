<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Detalhes do Atendimento</h1>
        <p class="text-sm text-gray-600 mt-1">Visualize e responda as mensagens da conversa.</p>
      </div>
      <NuxtLink to="/admin/atendimentos" class="text-blue-600 hover:text-blue-800">
        Voltar
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar o atendimento.</div>

    <div v-else-if="conversation" class="space-y-6">
      <div class="bg-white rounded shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Informações do Cliente</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Nome:</span>
            <span class="ml-2 font-medium">{{ conversation.customerName || 'Não informado' }}</span>
          </div>
          <div>
            <span class="text-gray-600">E-mail:</span>
            <span class="ml-2 font-medium">{{ conversation.customerEmail || 'Não informado' }}</span>
          </div>
          <div>
            <span class="text-gray-600">Pedido:</span>
            <span class="ml-2 font-medium">{{ conversation.orderNumber || 'Não informado' }}</span>
          </div>
          <div>
            <span class="text-gray-600">Status:</span>
            <span class="ml-2 font-medium">{{ conversation.status }}</span>
          </div>
          <div v-if="conversation.sourcePage" class="md:col-span-2">
            <span class="text-gray-600">Página de origem:</span>
            <a
              :href="conversation.sourcePage"
              target="_blank"
              rel="noopener noreferrer"
              class="ml-2 text-blue-600 hover:underline break-all"
            >
              {{ conversation.sourcePage }}
            </a>
          </div>
          <div>
            <span class="text-gray-600">Iniciado em:</span>
            <span class="ml-2 font-medium">{{ formatDateTime(conversation.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-600">Última atualização:</span>
            <span class="ml-2 font-medium">{{ formatDateTime(conversation.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Histórico da Conversa</h2>
          <div class="flex gap-2">
            <button
              v-if="conversation.status !== 'CLOSED'"
              @click="takeover"
              class="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 disabled:opacity-50"
              :disabled="takingOver || conversation.status === 'HUMAN'"
            >
              {{ takingOver ? 'Assumindo...' : 'Assumir atendimento' }}
            </button>
            <button
              v-if="conversation.status !== 'CLOSED'"
              @click="closeConversation"
              class="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
              :disabled="closing || conversation.status === 'CLOSED'"
            >
              {{ closing ? 'Encerrando...' : 'Encerrar atendimento' }}
            </button>
          </div>
        </div>

        <div ref="messagesContainer" class="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
          <div
            v-for="msg in conversation.messages"
            :key="msg.id"
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
              msg.sender === 'CUSTOMER'
                ? 'ml-auto bg-blue-600 text-white'
                : msg.sender === 'AGENT'
                  ? 'mr-auto bg-green-100 text-gray-800'
                  : msg.sender === 'SYSTEM'
                    ? 'mx-auto bg-gray-200 text-center text-gray-600 max-w-full'
                    : 'mr-auto bg-white text-gray-800 border border-gray-200'
            ]"
          >
            <div v-if="msg.sender === 'AGENT'" class="text-xs font-semibold text-green-700 mb-1">Atendente</div>
            <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
            <div class="text-xs mt-1 opacity-70">
              {{ formatTime(msg.createdAt) }}
            </div>
          </div>
        </div>

        <div v-if="conversation.status !== 'CLOSED'">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <textarea
              v-model="replyMessage"
              class="flex-1 border rounded-lg p-3 text-sm resize-none"
              rows="2"
              placeholder="Digite sua resposta..."
              :disabled="sending"
              @keydown.ctrl.enter="sendMessage"
            />
            <button
              type="submit"
              :disabled="!replyMessage.trim() || sending"
              class="self-end px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ sending ? 'Enviando...' : 'Enviar' }}
            </button>
          </form>
          <div class="text-xs text-gray-500 mt-2">Ctrl + Enter para enviar</div>
        </div>

        <div v-else class="bg-gray-100 p-4 rounded text-center text-gray-600">
          Este atendimento foi encerrado.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const conversationId = computed(() => String(route.query.id || ''))

const pending = ref(false)
const error = ref(false)
const conversation = ref<any>(null)
const replyMessage = ref('')
const sending = ref(false)
const takingOver = ref(false)
const closing = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const pollingInterval = ref<any>(null)

onMounted(() => {
  console.log('[atendimentos/detalhes] Mounted with ID:', conversationId.value)
  if (!conversationId.value) {
    navigateTo('/admin/atendimentos')
    return
  }
  loadConversation()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

watch(conversationId, () => {
  if (conversationId.value) {
    loadConversation()
  }
})

async function loadConversation() {
  if (!conversationId.value) return

  pending.value = true
  error.value = false

  try {
    const response = await $fetch(`/api/admin/chat/${conversationId.value}`) as any
    conversation.value = response.conversation

    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('[atendimentos/detalhes] Error loading conversation:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

async function sendMessage() {
  if (!replyMessage.value.trim() || sending.value || !conversationId.value) return

  const messageText = replyMessage.value.trim()
  replyMessage.value = ''
  sending.value = true

  try {
    await $fetch('/api/admin/chat/reply', {
      method: 'POST',
      body: {
        conversationId: conversationId.value,
        message: messageText
      }
    })

    await loadConversation()
  } catch (err) {
    console.error('[atendimentos/detalhes] Error sending reply:', err)
    alert('Erro ao enviar resposta. Tente novamente.')
  } finally {
    sending.value = false
  }
}

async function takeover() {
  if (takingOver.value || !conversationId.value || conversation.value?.status === 'HUMAN') return

  takingOver.value = true

  try {
    await $fetch('/api/admin/chat/takeover', {
      method: 'POST',
      body: {
        conversationId: conversationId.value
      }
    })

    await loadConversation()
  } catch (err) {
    console.error('[atendimentos/detalhes] Error taking over:', err)
    alert('Erro ao assumir atendimento. Tente novamente.')
  } finally {
    takingOver.value = false
  }
}

async function closeConversation() {
  if (closing.value || !conversationId.value || conversation.value?.status === 'CLOSED') return

  if (!confirm('Tem certeza que deseja encerrar este atendimento?')) return

  closing.value = true

  try {
    await $fetch('/api/admin/chat/close', {
      method: 'POST',
      body: {
        conversationId: conversationId.value
      }
    })

    await loadConversation()
  } catch (err) {
    console.error('[atendimentos/detalhes] Error closing conversation:', err)
    alert('Erro ao encerrar atendimento. Tente novamente.')
  } finally {
    closing.value = false
  }
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    loadConversation()
  }, 4000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function scrollToBottom() {
  if (!messagesContainer.value) return

  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
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

function formatTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
