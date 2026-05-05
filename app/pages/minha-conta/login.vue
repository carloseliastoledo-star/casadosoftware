<template>
  <section class="bg-gray-50 min-h-screen py-12">
    <div class="max-w-lg mx-auto px-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 class="text-2xl font-bold text-gray-900">Minha conta</h1>
        <p class="text-sm text-gray-600 mt-2">Entre para ver seus pedidos e licenças.</p>

        <div class="mt-6 flex gap-2">
          <button
            type="button"
            @click="mode = 'login'"
            :class="mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="flex-1 py-3 rounded-xl text-sm font-semibold"
          >
            Entrar
          </button>
          <button
            type="button"
            @click="mode = 'register'"
            :class="mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="flex-1 py-3 rounded-xl text-sm font-semibold"
          >
            Criar conta
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input v-model="email" type="email" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <div v-if="mode === 'register'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input v-model="nome" type="text" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <div v-if="mode === 'register'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Whatsapp</label>
            <input v-model="whatsapp" type="tel" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <div v-if="mode === 'register'">
            <label class="block text-sm font-medium text-gray-700 mb-2">CPF</label>
            <input v-model="cpf" inputmode="numeric" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input v-model="password" type="password" class="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl" />
          </div>

          <NuxtLink
            v-if="mode === 'login'"
            to="/minha-conta/esqueci-senha"
            class="block text-sm text-blue-600 hover:underline"
          >
            Esqueci a senha
          </NuxtLink>

          <button
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-60"
          >
            {{ loading ? 'Aguarde...' : (mode === 'login' ? 'Entrar' : 'Criar conta') }}
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
const returnTo = computed(() => {
  const raw = String(route.query?.returnTo || '').trim()
  if (!raw) return '/minha-conta'
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/minha-conta'
})

const mode = ref<'login' | 'register'>('login')

const email = ref('')
const password = ref('')
const nome = ref('')
const whatsapp = ref('')
const cpf = ref('')

const loading = ref(false)
const error = ref('')

async function submit() {
  if (loading.value) return
  loading.value = true
  error.value = ''

  try {
    if (mode.value === 'login') {
      await $fetch('/api/customer/auth/login', {
        method: 'POST',
        body: { email: email.value, password: password.value }
      })
    } else {
      await $fetch('/api/customer/auth/register', {
        method: 'POST',
        body: {
          email: email.value,
          password: password.value,
          nome: nome.value,
          whatsapp: whatsapp.value,
          cpf: cpf.value
        }
      })
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.response?.status
    const data = err?.data || err?.response?._data || err?.response?.data
    const msg =
      data?.statusMessage ||
      data?.message ||
      err?.statusMessage ||
      err?.message ||
      'Não foi possível continuar'

    error.value = status ? `[${status}] ${msg}` : String(msg)
    return
  }

  const destination = returnTo.value
  try {
    await navigateTo(destination)
  } catch (err: any) {
    if (import.meta.client) {
      try {
        window.location.href = destination
        return
      } catch {
        // ignore
      }
    }

    const status = err?.statusCode || err?.response?.status
    const data = err?.data || err?.response?._data || err?.response?.data
    const msg =
      data?.statusMessage ||
      data?.message ||
      err?.statusMessage ||
      err?.message ||
      'Login realizado, mas não foi possível abrir sua conta. Recarregue a página.'

    error.value = status ? `[${status}] ${msg}` : String(msg)
  } finally {
    loading.value = false
  }
}
</script>
