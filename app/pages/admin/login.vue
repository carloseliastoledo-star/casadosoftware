<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const route = useRoute()

async function submit() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    // Confirma se a sessão realmente ficou ativa (cookie persistido)
    try {
      await $fetch('/api/admin/auth/me')
    } catch {
      error.value = 'Sessão não foi salva no navegador (cookie bloqueado). Tente novamente fora da aba anônima ou verifique configurações de cookies.'
      return
    }

    const redirect = String(route.query.redirect || '')
    const target = redirect && redirect.startsWith('/') ? redirect : '/admin'
    try {
      await navigateTo(target)
    } catch (navErr: any) {
      const msg = navErr?.message ? String(navErr.message) : 'Erro ao navegar após login'
      error.value = msg
      if (import.meta.client) window.location.href = target
    }
  } catch (err: any) {
    const statusCode = err?.data?.statusCode || err?.statusCode
    const statusMessage = err?.data?.statusMessage || err?.statusMessage
    const message = err?.data?.message || err?.message
    error.value = String(statusMessage || message || 'Erro ao fazer login')
    if (statusCode) error.value = `${statusCode}: ${error.value}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow w-96">
      <h1 class="text-xl font-bold mb-6 text-center">
        Login Administrativo
      </h1>

      <input
        v-model="email"
        placeholder="Email"
        class="w-full border p-2 rounded mb-4"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Senha"
        class="w-full border p-2 rounded mb-4"
      />

      <div v-if="error" class="text-sm text-red-600 mb-4">
        {{ error }}
      </div>

      <button
        :disabled="loading"
        @click="submit"
        class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
      >
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </div>
  </div>
</template>
