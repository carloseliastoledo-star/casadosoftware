<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Usuários Admin</h1>
        <p class="text-sm text-gray-600 mt-1">Gerencie os usuários com acesso ao painel administrativo.</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + Novo Usuário
      </button>
    </div>

    <div v-if="pending" class="text-gray-500">Carregando...</div>
    <div v-else-if="error" class="text-red-600">Não foi possível carregar os usuários.</div>

    <div v-else class="bg-white rounded shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="p-3 text-left">E-mail</th>
            <th class="p-3 text-left">Role</th>
            <th class="p-3 text-left">Criado em</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t">
            <td class="p-3">{{ user.email }}</td>
            <td class="p-3">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                ]"
              >
                {{ user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editor' : 'Atendente' }}
              </span>
            </td>
            <td class="p-3 text-gray-500">{{ formatDate(user.createdAt) }}</td>
            <td class="p-3">
              <button
                v-if="user.role !== 'admin' && currentUser?.role === 'admin'"
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-800"
              >
                Excluir
              </button>
              <span v-else class="text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="p-8 text-center text-gray-500">
        Nenhum usuário encontrado.
      </div>
    </div>

    <!-- Modal para criar usuário -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Novo Usuário</h2>
        
        <form @submit.prevent="createUser">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">E-mail</label>
            <input
              v-model="newUser.email"
              type="email"
              class="w-full border rounded-lg p-3"
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Senha</label>
            <input
              v-model="newUser.password"
              type="password"
              class="w-full border rounded-lg p-3"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Role</label>
            <select v-model="newUser.role" class="w-full border rounded-lg p-3">
              <option value="editor">Editor</option>
              <option value="agent">Atendente (só chat)</option>
              <option value="admin">Admin</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Atendentes só podem acessar a área de chat.
            </p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ creating ? 'Criando...' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const pending = ref(false)
const error = ref(false)
const users = ref<any[]>([])
const currentUser = ref<any>(null)
const showModal = ref(false)
const creating = ref(false)

const newUser = ref({
  email: '',
  password: '',
  role: 'editor'
})

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  pending.value = true
  error.value = false

  try {
    const response = await $fetch('/api/admin/users') as any
    users.value = response.users || []
    currentUser.value = response.currentUser || null
  } catch (err) {
    console.error('[usuarios] Error loading users:', err)
    error.value = true
  } finally {
    pending.value = false
  }
}

async function createUser() {
  if (!newUser.value.email || !newUser.value.password) return

  creating.value = true

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: newUser.value
    })

    showModal.value = false
    newUser.value = { email: '', password: '', role: 'editor' }
    await loadUsers()
  } catch (err: any) {
    console.error('[usuarios] Error creating user:', err)
    alert(err.data?.message || 'Erro ao criar usuário. Tente novamente.')
  } finally {
    creating.value = false
  }
}

async function deleteUser(id: string) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return

  try {
    await $fetch(`/api/admin/users/${id}`, {
      method: 'DELETE'
    })

    await loadUsers()
  } catch (err: any) {
    console.error('[usuarios] Error deleting user:', err)
    alert(err.data?.message || 'Erro ao excluir usuário. Tente novamente.')
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}
</script>
