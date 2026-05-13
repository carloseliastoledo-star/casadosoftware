<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface Review {
  id: string
  customerName: string
  productName: string
  productId: string | null
  rating: number
  comment: string
  source: string
  verified: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

const filterPublished = ref<'all' | 'published' | 'unpublished'>('all')
const filterProductId = ref('')

const { data, pending, refresh } = await useFetch<{
  ok: true
  reviews: Review[]
}>('/api/admin/reviews', {
  query: computed(() => ({
    productId: filterProductId.value || undefined,
    published: filterPublished.value === 'all' ? undefined : filterPublished.value === 'published' ? 'true' : 'false'
  }))
})

const reviews = computed(() => data.value?.reviews || [])

// Modal de criação/edição
const showEditModal = ref(false)
const editReview = ref<Review | null>(null)
const formData = ref({
  customerName: '',
  productName: '',
  productId: '',
  rating: 5,
  comment: '',
  source: 'manual',
  verified: true,
  published: false
})
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')

function openCreateModal() {
  editReview.value = null
  formData.value = {
    customerName: '',
    productName: '',
    productId: '',
    rating: 5,
    comment: '',
    source: 'manual',
    verified: true,
    published: false
  }
  showEditModal.value = true
  saveMessage.value = ''
  saveError.value = ''
}

function openEditModal(review: Review) {
  editReview.value = review
  formData.value = {
    customerName: review.customerName,
    productName: review.productName,
    productId: review.productId || '',
    rating: review.rating,
    comment: review.comment,
    source: review.source,
    verified: review.verified,
    published: review.published
  }
  showEditModal.value = true
  saveMessage.value = ''
  saveError.value = ''
}

async function saveReview() {
  saving.value = true
  saveMessage.value = ''
  saveError.value = ''

  try {
    if (editReview.value) {
      // Editar
      await $fetch(`/api/admin/reviews/${editReview.value.id}`, {
        method: 'PUT',
        body: formData.value
      })
    } else {
      // Criar
      await $fetch('/api/admin/reviews', {
        method: 'POST',
        body: formData.value
      })
    }

    saveMessage.value = editReview.value ? 'Avaliação atualizada com sucesso' : 'Avaliação criada com sucesso'
    showEditModal.value = false
    await refresh()
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || 'Erro ao salvar avaliação'
  } finally {
    saving.value = false
  }
}

async function togglePublish(review: Review) {
  try {
    await $fetch(`/api/admin/reviews/${review.id}/publish`, {
      method: 'PATCH',
      body: { published: !review.published }
    })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao atualizar status')
  }
}

async function deleteReview(review: Review) {
  if (!confirm(`Tem certeza que deseja excluir a avaliação de ${review.customerName}?`)) return

  try {
    await $fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err?.data?.statusMessage || 'Erro ao excluir avaliação')
  }
}

const formattedDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Avaliações</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Nova Avaliação
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex gap-4 mb-6">
      <select v-model="filterPublished" class="px-4 py-2 border border-gray-300 rounded-lg">
        <option value="all">Todas</option>
        <option value="published">Publicadas</option>
        <option value="unpublished">Não publicadas</option>
      </select>

      <input
        v-model="filterProductId"
        type="text"
        placeholder="Filtrar por produto..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-center py-12 text-gray-600">
      Carregando avaliações...
    </div>

    <!-- Lista de avaliações -->
    <div v-else-if="reviews.length > 0" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div class="font-semibold text-gray-900">{{ review.customerName }}</div>
              <div class="text-sm text-gray-500">{{ review.productName }}</div>
              <div v-if="review.verified" class="text-xs text-green-600 font-medium">✓ Verificado</div>
              <div :class="review.published ? 'text-green-600' : 'text-gray-400'" class="text-xs font-medium">
                {{ review.published ? '✓ Publicada' : '○ Não publicada' }}
              </div>
            </div>

            <RatingStars :rating="review.rating" size="sm" class="mb-2" />

            <p class="text-gray-700 text-sm">{{ review.comment }}</p>

            <div class="mt-2 text-xs text-gray-400">
              {{ review.source }} • {{ formattedDate(review.createdAt) }}
            </div>
          </div>

          <div class="flex gap-2 ml-4">
            <button
              @click="togglePublish(review)"
              class="px-3 py-1 text-sm rounded border"
              :class="review.published ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'border-green-300 text-green-600 hover:bg-green-50'"
            >
              {{ review.published ? 'Despublicar' : 'Publicar' }}
            </button>
            <button
              @click="openEditModal(review)"
              class="px-3 py-1 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Editar
            </button>
            <button
              @click="deleteReview(review)"
              class="px-3 py-1 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sem avaliações -->
    <div v-else class="text-center py-12 text-gray-600">
      Nenhuma avaliação encontrada.
    </div>

    <!-- Modal de edição/criação -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editReview ? 'Editar Avaliação' : 'Nova Avaliação' }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do cliente</label>
            <input
              v-model="formData.customerName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do produto</label>
            <input
              v-model="formData.productName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: Office 365 Vitalício"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID do produto (opcional)</label>
            <input
              v-model="formData.productId"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="ID do produto no sistema"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nota (1-5)</label>
            <input
              v-model.number="formData.rating"
              type="number"
              min="1"
              max="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
            <textarea
              v-model="formData.comment"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Comentário do cliente..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Origem</label>
            <select v-model="formData.source" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="manual">Manual</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="google">Google</option>
              <option value="support">Suporte</option>
            </select>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input v-model="formData.verified" type="checkbox" class="h-4 w-4" />
              <span class="text-sm text-gray-700">Verificado</span>
            </label>

            <label class="flex items-center gap-2">
              <input v-model="formData.published" type="checkbox" class="h-4 w-4" />
              <span class="text-sm text-gray-700">Publicado</span>
            </label>
          </div>
        </div>

        <div v-if="saveMessage" class="mt-4 text-sm text-green-600">
          {{ saveMessage }}
        </div>

        <div v-if="saveError" class="mt-4 text-sm text-red-600">
          {{ saveError }}
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="saveReview"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
