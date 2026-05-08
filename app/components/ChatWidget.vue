<template>
  <ClientOnly>
    <div>
      <button
        v-if="!isOpen"
        @click="toggleChat"
        class="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 lg:bottom-4 lg:right-4"
        aria-label="Abrir chat"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      <div
        v-else
        class="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-[360px] flex-col rounded-2xl bg-white shadow-2xl lg:bottom-4 lg:right-4"
        style="height: 560px; max-height: 80vh;"
      >
        <div class="flex items-center justify-between border-b border-gray-200 bg-blue-600 p-4 rounded-t-2xl">
          <div>
            <h3 class="text-lg font-semibold text-white">Chat Casa do Software</h3>
            <p class="text-xs text-blue-100">
              {{ status === 'HUMAN' ? 'Atendimento humano' : status === 'CLOSED' ? 'Encerrado' : 'Assistente virtual' }}
            </p>
          </div>
          <button @click="toggleChat" class="text-white hover:text-blue-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div v-if="status === 'HUMAN'" class="bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Atendimento encaminhado para humano. Você pode continuar enviando mensagens por aqui.
        </div>

        <div v-if="status === 'CLOSED'" class="bg-red-50 px-4 py-2 text-xs text-red-700">
          Este atendimento foi encerrado. Abra uma nova conversa se precisar de ajuda.
        </div>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="[
              'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
              msg.sender === 'CUSTOMER'
                ? 'ml-auto bg-blue-600 text-white'
                : msg.sender === 'AGENT'
                  ? 'mr-auto bg-green-100 text-gray-800'
                  : msg.sender === 'SYSTEM'
                    ? 'mx-auto bg-gray-100 text-center text-gray-600 text-xs max-w-full'
                    : 'mr-auto bg-gray-100 text-gray-800'
            ]"
          >
            <span v-if="msg.sender === 'AGENT'" class="block text-xs font-semibold text-green-700 mb-1">Atendente</span>
            <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
          </div>

          <div v-if="isTyping" class="mr-auto bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-600">
            Digitando...
          </div>
        </div>

        <div v-if="status !== 'CLOSED'" class="border-t border-gray-200 p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Digite sua mensagem..."
              class="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              :disabled="isSending"
              @keydown.enter="sendMessage"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || isSending"
              class="rounded-full bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

        <div v-else class="border-t border-gray-200 p-4">
          <button
            @click="startNewConversation"
            class="w-full rounded-full bg-blue-600 px-4 py-2 text-white text-sm transition-colors hover:bg-blue-700"
          >
            Nova conversa
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const conversationId = ref<string | null>(null)
const messages = ref<Array<{ id: string; sender: string; content: string; createdAt: string }>>([])
const newMessage = ref('')
const isSending = ref(false)
const isTyping = ref(false)
const status = ref<'AI' | 'HUMAN' | 'CLOSED'>('AI')
const pollingInterval = ref<any>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const STORAGE_KEY = 'chatConversationId'

onMounted(() => {
  if (!import.meta.client) return

  const savedId = localStorage.getItem(STORAGE_KEY)
  if (savedId) {
    conversationId.value = savedId
    loadMessages()
  }
})

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
})

watch(isOpen, (newValue) => {
  if (newValue && !conversationId.value) {
    startConversation()
  } else if (newValue && conversationId.value) {
    loadMessages()
    startPolling()
  } else {
    stopPolling()
  }
})

function toggleChat() {
  isOpen.value = !isOpen.value
}

async function startConversation() {
  if (!import.meta.client) return

  try {
    const sourcePage = window.location.href

    const response = await $fetch('/api/chat/start', {
      method: 'POST',
      body: { sourcePage }
    }) as any

    conversationId.value = response.conversationId
    status.value = response.status

    if (import.meta.client && conversationId.value) {
      localStorage.setItem(STORAGE_KEY, conversationId.value)
    }

    messages.value = [
      {
        id: 'initial',
        sender: 'AI',
        content: response.message,
        createdAt: new Date().toISOString()
      }
    ]

    scrollToBottom()
  } catch (error) {
    console.error('[ChatWidget] Error starting conversation:', error)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || isSending.value || !conversationId.value) return

  const messageText = newMessage.value.trim()
  newMessage.value = ''
  isSending.value = true

  messages.value.push({
    id: `temp-${Date.now()}`,
    sender: 'CUSTOMER',
    content: messageText,
    createdAt: new Date().toISOString()
  })

  scrollToBottom()

  try {
    isTyping.value = true

    const response = await $fetch('/api/chat/message', {
      method: 'POST',
      body: {
        conversationId: conversationId.value,
        message: messageText
      }
    }) as any

    status.value = response.status

    messages.value.push({
      id: `ai-${Date.now()}`,
      sender: 'AI',
      content: response.reply,
      createdAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[ChatWidget] Error sending message:', error)
    messages.value.push({
      id: `error-${Date.now()}`,
      sender: 'SYSTEM',
      content: error.data?.statusMessage || 'Erro ao enviar mensagem. Tente novamente.',
      createdAt: new Date().toISOString()
    })
  } finally {
    isSending.value = false
    isTyping.value = false
    scrollToBottom()
  }
}

async function loadMessages() {
  if (!conversationId.value) return

  try {
    const response = await $fetch('/api/chat/messages', {
      query: { conversationId: conversationId.value }
    }) as any

    status.value = response.status
    messages.value = response.messages || []

    scrollToBottom()
  } catch (error) {
    console.error('[ChatWidget] Error loading messages:', error)
  }
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    loadMessages()
  }, 4000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function scrollToBottom() {
  if (!import.meta.client || !messagesContainer.value) return

  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

function startNewConversation() {
  if (import.meta.client) {
    localStorage.removeItem(STORAGE_KEY)
  }
  conversationId.value = null
  messages.value = []
  status.value = 'AI'
  startConversation()
}
</script>
