<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-md mx-auto px-6 py-12">
      <h1 class="text-2xl font-bold text-gray-900">Área do Afiliado</h1>
      <p class="mt-2 text-sm text-gray-600">Entre com seu e-mail e senha.</p>

      <div class="mt-6 bg-white rounded-2xl border p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-900">E-mail</label>
          <input v-model="email" type="email" class="mt-1 w-full rounded-lg border px-4 py-3" autocomplete="email" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900">Senha</label>
          <input v-model="password" type="password" class="mt-1 w-full rounded-lg border px-4 py-3" autocomplete="current-password" />
        </div>

        <button
          type="button"
          class="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 disabled:opacity-60"
          :disabled="loading"
          @click="login"
        >
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/affiliate/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    const next = String((route.query as any)?.next || '').trim()
    await navigateTo(next || '/affiliate/dashboard')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Falha ao entrar'
  } finally {
    loading.value = false
  }
}
</script>
