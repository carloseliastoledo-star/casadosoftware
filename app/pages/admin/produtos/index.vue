<script setup>
definePageMeta({ layout: 'admin' })

const { data, refresh } = await useFetch('/api/admin/produtos')

const deletingId = ref('')

async function excluirProduto(id) {
  const ok = confirm('Tem certeza que deseja excluir este produto?')
  if (!ok) return

  deletingId.value = id

  try {
    const res: any = await $fetch(`/api/admin/produtos/${id}`, {
      method: 'DELETE'
    })

    if (res?.deactivated && res?.message) {
      alert(res.message)
    }
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.message || 'Não foi possível excluir o produto')
  } finally {
    deletingId.value = ''
  }
}

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
          <th class="p-3 text-left">Status</th>
          <th class="p-3 text-left">Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in produtos"
          :key="p.id"
          class="border-t"
        >
          <td class="p-3 font-medium">{{ p.nome }}</td>
          <td class="p-3">
            <span v-if="p.precoAntigo" class="text-gray-400 line-through mr-2">R$ {{ p.precoAntigo }}</span>
            <span>R$ {{ p.preco }}</span>
          </td>
          <td class="p-3 text-gray-500">{{ p.slug }}</td>
          <td class="p-3">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
              :class="p.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ p.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td class="p-3">
            <div class="flex items-center gap-4">
              <NuxtLink
                :to="`/admin/produtos/editar/${p.id}`"
                class="text-blue-600 hover:underline font-medium"
              >
                Editar
              </NuxtLink>

              <button
                type="button"
                class="text-red-600 hover:underline font-medium disabled:opacity-50"
                :disabled="deletingId === p.id"
                @click="excluirProduto(p.id)"
              >
                {{ deletingId === p.id ? 'Excluindo...' : 'Excluir' }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
