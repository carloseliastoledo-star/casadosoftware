<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data, refresh } = await useFetch('/api/admin/office365-trials')

const editingId = ref('')
const editForm = ref({
  status: '',
  microsoftLogin: '',
  temporaryPassword: '',
  checkoutUrl: '',
  notes: ''
})
const sendingEmail = ref(false)

const statusOptions = ['PENDING', 'ACCESS_SENT', 'ACTIVE', 'PAYMENT_SENT', 'PAID', 'EXPIRED', 'BLOCKED', 'REACTIVATED']

function openEdit(lead: any) {
  editingId.value = lead.id
  editForm.value = {
    status: lead.status,
    microsoftLogin: lead.microsoftLogin || '',
    temporaryPassword: lead.temporaryPassword || '',
    checkoutUrl: lead.checkoutUrl || '',
    notes: lead.notes || ''
  }
}

function closeEdit() {
  editingId.value = ''
  editForm.value = {
    status: '',
    microsoftLogin: '',
    temporaryPassword: '',
    checkoutUrl: '',
    notes: ''
  }
}

async function saveEdit() {
  try {
    await $fetch(`/api/admin/office365-trials/${editingId.value}`, {
      method: 'PUT',
      body: editForm.value
    })
    closeEdit()
    await refresh()
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Erro ao salvar')
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copiado!')
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCESS_SENT: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAYMENT_SENT: 'bg-purple-100 text-purple-700',
    PAID: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
    BLOCKED: 'bg-red-100 text-red-700',
    REACTIVATED: 'bg-blue-100 text-blue-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

function generateDeliveryMessage(lead: any) {
  const expiresAt = lead.trialExpiresAt ? new Date(lead.trialExpiresAt).toLocaleDateString('pt-BR') : 'data a definir'
  return `Olá, ${lead.name}. Seu teste do Office 365 foi liberado por 7 dias.

Login: ${lead.microsoftLogin || 'a definir'}
Senha provisória: ${lead.temporaryPassword || 'a definir'}

Ao entrar pela primeira vez, a Microsoft pode solicitar alteração de senha e autenticação pelo Microsoft Authenticator.

Seu teste é válido até ${expiresAt}.`
}

function generatePaymentMessage(lead: any) {
  return `Olá, ${lead.name}. Seu teste gratuito termina em breve. Para continuar usando o Office 365, finalize o pagamento:
${lead.checkoutUrl || 'link a definir'}

Caso não deseje continuar, o acesso poderá ser encerrado automaticamente.`
}

function openWhatsApp(lead: any, message: string) {
  const phone = lead.whatsapp.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank')
}

async function sendEmail(type: string, lead: any) {
  if (!confirm(`Confirmar envio do e-mail para ${lead.email}?`)) {
    return
  }

  sendingEmail.value = true
  try {
    await $fetch(`/api/admin/office365-trials/${lead.id}/send-email`, {
      method: 'POST',
      body: { type }
    })
    alert('E-mail enviado com sucesso.')
    await refresh()
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Erro ao enviar e-mail')
  } finally {
    sendingEmail.value = false
  }
}

async function generateCheckout(lead: any) {
  if (!confirm(`Gerar link de checkout para ${lead.email}?`)) {
    return
  }

  try {
    const result = await $fetch(`/api/admin/office365-trials/${lead.id}/generate-checkout`, {
      method: 'POST'
    })
    alert(`Link de checkout gerado: ${result.checkoutUrl}`)
    await refresh()
  } catch (error: any) {
    alert(error?.data?.statusMessage || 'Erro ao gerar checkout')
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Testes Office 365</h1>
      <a href="/lp/office-365-teste-gratis" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
        Ver landing page
      </a>
    </div>

    <div v-if="!data?.leads || data.leads.length === 0" class="text-gray-500">
      Nenhum lead encontrado
    </div>

    <div v-else class="bg-white rounded shadow overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Nome</th>
            <th class="p-3 text-left">E-mail</th>
            <th class="p-3 text-left">WhatsApp</th>
            <th class="p-3 text-left">Sistema</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-left">Início</th>
            <th class="p-3 text-left">Expira</th>
            <th class="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in data.leads" :key="lead.id" class="border-t">
            <td class="p-3 font-medium">{{ lead.name }}</td>
            <td class="p-3">{{ lead.email }}</td>
            <td class="p-3">{{ lead.whatsapp }}</td>
            <td class="p-3">{{ lead.systemType }}</td>
            <td class="p-3">
              <span
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="getStatusColor(lead.status)"
              >
                {{ lead.status }}
              </span>
            </td>
            <td class="p-3">{{ formatDate(lead.trialStartAt) }}</td>
            <td class="p-3">{{ formatDate(lead.trialExpiresAt) }}</td>
            <td class="p-3">
              <button
                @click="openEdit(lead)"
                class="text-blue-600 hover:text-blue-700 mr-2"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de edição -->
    <div v-if="editingId" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Editar Lead</h2>

        <div class="space-y-4">
          <div>
            <label class="block font-medium mb-2">Status</label>
            <select
              v-model="editForm.status"
              class="w-full border rounded px-3 py-2"
            >
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-medium mb-2">Login Microsoft</label>
            <input
              v-model="editForm.microsoftLogin"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label class="block font-medium mb-2">Senha provisória</label>
            <input
              v-model="editForm.temporaryPassword"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Senha temporária"
            />
          </div>

          <div>
            <label class="block font-medium mb-2">Link de checkout</label>
            <div class="flex gap-2">
              <input
                v-model="editForm.checkoutUrl"
                type="text"
                class="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
              <button
                @click="generateCheckout(data?.leads?.find((l: any) => l.id === editingId))"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm whitespace-nowrap"
              >
                Gerar
              </button>
            </div>
          </div>

          <div>
            <label class="block font-medium mb-2">Notas</label>
            <textarea
              v-model="editForm.notes"
              class="w-full border rounded px-3 py-2"
              rows="3"
              placeholder="Observações..."
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="saveEdit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Salvar
          </button>
          <button
            @click="closeEdit"
            class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

        <!-- Botões de e-mail -->
        <div class="mt-6 pt-6 border-t">
          <h3 class="font-semibold mb-3">Enviar e-mails</h3>
          <div class="space-y-2">
            <button
              @click="sendEmail('delivery', data?.leads?.find((l: any) => l.id === editingId))"
              :disabled="sendingEmail || !editForm.microsoftLogin || !editForm.temporaryPassword"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
            >
              {{ sendingEmail ? 'Enviando...' : 'Enviar e-mail de acesso' }}
            </button>
            <p v-if="!editForm.microsoftLogin || !editForm.temporaryPassword" class="text-xs text-gray-500">
              Preencha login Microsoft e senha provisória antes de enviar o e-mail de entrega.
            </p>

            <div class="pt-2">
              <p class="text-xs text-gray-500 mb-2">E-mails de cobrança:</p>
              <div class="space-y-2">
                <button
                  @click="sendEmail('day5', data?.leads?.find((l: any) => l.id === editingId))"
                  :disabled="sendingEmail || !editForm.checkoutUrl"
                  class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
                >
                  {{ sendingEmail ? 'Enviando...' : 'Enviar e-mail dia 5' }}
                </button>
                <button
                  @click="sendEmail('day7', data?.leads?.find((l: any) => l.id === editingId))"
                  :disabled="sendingEmail || !editForm.checkoutUrl"
                  class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
                >
                  {{ sendingEmail ? 'Enviando...' : 'Enviar e-mail vencimento hoje' }}
                </button>
                <button
                  @click="sendEmail('expired', data?.leads?.find((l: any) => l.id === editingId))"
                  :disabled="sendingEmail || !editForm.checkoutUrl"
                  class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded text-sm"
                >
                  {{ sendingEmail ? 'Enviando...' : 'Enviar e-mail pós-expiração' }}
                </button>
              </div>
              <p v-if="!editForm.checkoutUrl" class="text-xs text-gray-500 mt-2">
                Preencha o link de checkout antes de enviar cobrança.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
