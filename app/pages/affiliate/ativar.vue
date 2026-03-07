<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-md mx-auto px-6 py-12">
      <h1 class="text-2xl font-bold text-gray-900">Ativar conta de afiliado</h1>
      <p class="mt-2 text-sm text-gray-600">Crie sua senha para acessar o painel.</p>

      <div class="mt-6 bg-white rounded-2xl border p-6 space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-900">Token</label>
          <input v-model="token" type="text" class="mt-1 w-full rounded-lg border px-4 py-3 font-mono text-sm" autocomplete="off" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900">Nova senha</label>
          <input v-model="password" type="password" class="mt-1 w-full rounded-lg border px-4 py-3" autocomplete="new-password" />
          <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres.</p>
        </div>

        <button
          type="button"
          class="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 disabled:opacity-60"
          :disabled="loading"
          @click="activate"
        >
          {{ loading ? 'Ativando…' : 'Ativar' }}
        </button>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-700">Conta ativada. Redirecionando…</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

const token = ref(String((route.query as any)?.token || '').trim())
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function activate() {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await $fetch('/api/affiliate/auth/activate', {
      method: 'POST',
      body: { token: token.value, password: password.value }
    })

    success.value = true
    await navigateTo('/affiliate/dashboard')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Falha ao ativar'
  } finally {
    loading.value = false
  }
}
</script>
