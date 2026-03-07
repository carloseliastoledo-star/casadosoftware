<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, pending, error, refresh } = await useFetch('/api/admin/partner-applications', {
  server: true
})

const items = computed(() => (data.value as any)?.items || [])

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('pt-BR')
  } catch {
    return d
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-4 flex-wrap mb-6">
      <h1 class="text-2xl font-bold">Inscrições (Afiliados)</h1>
      <button type="button" class="bg-gray-900 text-white px-4 py-2 rounded" @click="refresh">Atualizar</button>
    </div>

    <div v-if="pending" class="text-gray-600">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Erro ao carregar inscrições.</div>

    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">Nenhuma inscrição encontrada.</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full bg-white rounded shadow text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-left">Data</th>
              <th class="p-3 text-left">Nome</th>
              <th class="p-3 text-left">Email</th>
              <th class="p-3 text-left">País</th>
              <th class="p-3 text-left">Website</th>
              <th class="p-3 text-left">Social</th>
              <th class="p-3 text-left">Tráfego</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in items" :key="it.id" class="border-t">
              <td class="p-3 text-gray-600 whitespace-nowrap">{{ formatDate(it.createdAt) }}</td>
              <td class="p-3 font-medium">{{ it.name }}</td>
              <td class="p-3 text-gray-700">{{ it.email }}</td>
              <td class="p-3 text-gray-700">{{ it.country }}</td>
              <td class="p-3 text-gray-700">
                <a v-if="it.website" :href="it.website" target="_blank" class="text-blue-600 hover:underline">{{ it.website }}</a>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-3 text-gray-700">
                <span v-if="it.social">{{ it.social }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-3 text-gray-700">
                <span v-if="it.monthlyTraffic">{{ it.monthlyTraffic }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 bg-gray-50 border rounded p-4">
        <div class="text-sm font-semibold text-gray-900">Observação</div>
        <div class="text-sm text-gray-700 mt-1">
          Caso o SMTP não esteja configurado, o e-mail pode não ser enviado, mas as inscrições continuam sendo registradas aqui.
        </div>
      </div>
    </div>
  </div>
</template>
