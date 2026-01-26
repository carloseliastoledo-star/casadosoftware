<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-lg mx-auto px-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 class="text-2xl font-bold text-gray-900">Esqueci minha senha</h1>
        <p class="text-sm text-gray-600 mt-2">
          Informe seu e-mail. Se ele existir, enviaremos um link para criar/redefinir sua senha.
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input v-model="email" type="email" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <button
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60"
          >
            {{ loading ? 'Aguarde...' : 'Enviar link' }}
          </button>

          <div v-if="success" class="text-sm text-green-700">
            Se esse e-mail existir, enviamos um link para criar/redefinir sua senha.
          </div>

          <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

          <NuxtLink to="/minha-conta/login" class="block text-sm text-blue-600 hover:underline">
            Voltar para login
          </NuxtLink>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['customer'] })

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    await $fetch('/api/customer/auth/forgot', {
      method: 'POST',
      body: { email: email.value }
    })
    success.value = true
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Não foi possível enviar o link'
  } finally {
    loading.value = false
  }
}
</script>
