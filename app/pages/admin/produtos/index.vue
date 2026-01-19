<script setup>
definePageMeta({ layout: 'admin' })

const { data } = await useFetch('/api/admin/produtos')

// blindagem SSR
const produtos = computed(() => data.value || [])
</script>

<template>
  <div>
    <div class="flex justify-between mb-6">
      <h1 class="text-2xl font-bold">Produtos</h1>

      <NuxtLink
        to="/admin/produtos/novo"
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Adicionar novo
      </NuxtLink>
    </div>

    <div v-if="produtos.length === 0" class="text-gray-500">
      Nenhum produto cadastrado
    </div>

    <table
      v-else
      class="w-full bg-white rounded shadow text-sm"
    >
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Nome</th>
          <th class="p-3 text-left">Preço</th>
          <th class="p-3 text-left">Slug</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in produtos"
          :key="p.id"
          class="border-t"
        >
          <td class="p-3 font-medium">{{ p.nome }}</td>
          <td class="p-3">R$ {{ p.preco }}</td>
          <td class="p-3 text-gray-500">{{ p.slug }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
