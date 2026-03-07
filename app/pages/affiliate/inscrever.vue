<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="max-w-2xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-extrabold text-gray-900">Programa de Afiliados</h1>
      <p class="mt-2 text-gray-700">Preencha seus dados para solicitar sua inscrição como afiliado.</p>

      <div class="mt-8 bg-white rounded-2xl border p-6 md:p-8">
        <div v-if="submitted" class="space-y-3">
          <div class="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-sm font-semibold">
            <span>✔</span>
            Solicitação enviada
          </div>
          <p class="text-gray-700">Recebemos seu pedido. Vamos analisar e entraremos em contato.</p>
          <div class="pt-2">
            <NuxtLink to="/" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold inline-flex">
              Voltar para a Home
            </NuxtLink>
          </div>
        </div>

        <form v-else class="space-y-5" @submit.prevent="submit">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-900">Nome</label>
              <input v-model="form.name" class="mt-1 w-full rounded-lg border px-4 py-3" maxlength="120" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900">E-mail</label>
              <input v-model="form.email" type="email" class="mt-1 w-full rounded-lg border px-4 py-3" maxlength="255" required />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-900">WhatsApp (opcional)</label>
              <input v-model="form.whatsapp" class="mt-1 w-full rounded-lg border px-4 py-3" maxlength="40" placeholder="(DDD) 99999-9999" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-900">Canal / Site (opcional)</label>
              <input v-model="form.channel" class="mt-1 w-full rounded-lg border px-4 py-3" maxlength="255" placeholder="Instagram, YouTube, site, tráfego pago..." />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900">Como você pretende divulgar? (opcional)</label>
            <textarea v-model="form.message" rows="5" class="mt-1 w-full rounded-lg border px-4 py-3" maxlength="2000" />
          </div>

          <div class="flex items-center gap-4">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-60"
              :disabled="loading"
            >
              {{ loading ? 'Enviando…' : 'Enviar inscrição' }}
            </button>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </form>
      </div>

      <div class="mt-6 text-sm text-gray-600">
        Se você já recebeu um convite, acesse <NuxtLink to="/affiliate/login" class="text-blue-600 hover:underline">o login do afiliado</NuxtLink>.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Inscrição de Afiliado'
})

const form = reactive({
  name: '',
  email: '',
  whatsapp: '',
  channel: '',
  message: ''
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/affiliate-apply', {
      method: 'POST',
      body: { ...form }
    })
    submitted.value = true
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Falha ao enviar inscrição'
  } finally {
    loading.value = false
  }
}
</script>
