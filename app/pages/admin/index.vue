<script setup>
definePageMeta({
  layout: 'admin',
  ssr: false
})

const { data, pending, error } = useFetch('/api/admin/stats', { server: false })

const stats = computed(() => data.value || { produtosTotal: 0, licencasTotal: 0, ultimosProdutos: [] })
</script>

<template>
  <div class="space-y-6">

    <div class="bg-white rounded shadow p-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="mt-2 text-gray-600">Visão geral do sistema</p>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded p-4">
      Não foi possível carregar os dados do dashboard.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded shadow p-5">
        <div class="text-sm text-gray-500">Produtos</div>
        <div class="mt-2 text-3xl font-bold">
          {{ pending ? '...' : stats.produtosTotal }}
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/produtos" class="text-blue-600 hover:underline text-sm">
            Ver produtos
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded shadow p-5">
        <div class="text-sm text-gray-500">Licenças</div>
        <div class="mt-2 text-3xl font-bold">
          {{ pending ? '...' : stats.licencasTotal }}
        </div>
        <div class="mt-4">
          <NuxtLink to="/admin/licenses" class="text-blue-600 hover:underline text-sm">
            Ver licenças
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white rounded shadow p-5">
        <div class="text-sm text-gray-500">Ações rápidas</div>
        <div class="mt-4 space-y-2">
          <NuxtLink to="/admin/produtos/novo" class="block text-blue-600 hover:underline text-sm">
            Criar novo produto
          </NuxtLink>
          <NuxtLink to="/produtos" class="block text-blue-600 hover:underline text-sm">
            Ver loja
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow">
      <div class="px-6 py-4 border-b">
        <h2 class="font-bold">Últimos produtos</h2>
      </div>

      <div class="p-6">
        <div v-if="pending" class="text-gray-500 text-sm">
          Carregando...
        </div>

        <div v-else-if="!stats.ultimosProdutos?.length" class="text-gray-500 text-sm">
          Nenhum produto encontrado.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="py-2">Nome</th>
                <th class="py-2">Slug</th>
                <th class="py-2">Preço</th>
                <th class="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in stats.ultimosProdutos" :key="p.id" class="border-t">
                <td class="py-3 font-medium">{{ p.nome }}</td>
                <td class="py-3 text-gray-600">{{ p.slug }}</td>
                <td class="py-3">R$ {{ Number(p.preco).toFixed(2) }}</td>
                <td class="py-3 text-right">
                  <NuxtLink :to="`/admin/produtos/editar/${p.id}`" class="text-blue-600 hover:underline">
                    Editar
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>
