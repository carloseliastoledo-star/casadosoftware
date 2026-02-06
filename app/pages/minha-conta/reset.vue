<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-lg mx-auto px-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 class="text-2xl font-bold text-gray-900">Redefinir senha</h1>
        <p class="text-sm text-gray-600 mt-2">Crie uma nova senha para acessar sua conta.</p>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
            <input v-model="password" type="password" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar senha</label>
            <input v-model="confirm" type="password" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <button
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60"
          >
            {{ loading ? 'Aguarde...' : 'Salvar senha' }}
          </button>

          <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['customer'] })

const route = useRoute()
const token = computed(() => String(route.query.token || ''))

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''

  if (!token.value) {
    error.value = 'Token inválido'
    return
  }

  if (!password.value || password.value.length < 6) {
    error.value = 'Senha deve ter pelo menos 6 caracteres'
    return
  }

  if (password.value !== confirm.value) {
    error.value = 'As senhas não conferem'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/customer/auth/reset', {
      method: 'POST',
      body: { token: token.value, password: password.value }
    })

    await navigateTo('/minha-conta')
  } catch (err: any) {
    const status = err?.statusCode || err?.response?.status
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message
    error.value = status ? `[${status}] ${msg || 'Não foi possível redefinir a senha'}` : msg || 'Não foi possível redefinir a senha'
  } finally {
    loading.value = false
  }
}
</script>
