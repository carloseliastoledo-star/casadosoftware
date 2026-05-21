<script setup lang="ts">
definePageMeta({
  layout: false
})

const { logoPath, siteName } = useSiteBranding()

useHead({
  title: 'Teste Office 365 grátis por 7 dias | Casa do Software',
  meta: [
    { name: 'description', content: 'Teste o Office 365 por 7 dias antes de pagar. Receba acesso provisório, instale Word, Excel, PowerPoint e Outlook e continue somente se gostar.' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Teste Office 365 grátis por 7 dias | Casa do Software' },
    { property: 'og:description', content: 'Teste o Office 365 por 7 dias antes de pagar. Receba acesso provisório, instale Word, Excel, PowerPoint e Outlook e continue somente se gostar.' },
    { property: 'og:url', content: 'https://casadosoftware.com.br/lp/office-365-teste-gratis' }
  ],
  link: [
    { rel: 'canonical', href: 'https://casadosoftware.com.br/lp/office-365-teste-gratis' }
  ]
})

const formData = ref({
  name: '',
  email: '',
  whatsapp: '',
  usageType: '',
  systemType: '',
  acceptTerms: false
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function submitForm() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await $fetch('/api/office365-trial/request', {
      method: 'POST',
      body: formData.value
    })

    if (response?.success) {
      success.value = true
      formData.value = {
        name: '',
        email: '',
        whatsapp: '',
        usageType: '',
        systemType: '',
        acceptTerms: false
      }
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao processar solicitação'
  } finally {
    loading.value = false
  }
}

const faqs = ref([
  {
    question: 'O teste é oficial da Microsoft?',
    answer: 'Não. É uma condição promocional da Casa do Software usando acesso temporário em ambiente Microsoft 365 gerenciado.'
  },
  {
    question: 'Preciso pagar antes?',
    answer: 'Não. O pagamento é solicitado somente se você quiser continuar após o período de teste.'
  },
  {
    question: 'O que acontece depois de 7 dias?',
    answer: 'Você pode efetuar o pagamento para manter o acesso. Caso contrário, o acesso poderá ser encerrado.'
  },
  {
    question: 'Posso salvar arquivos no OneDrive?',
    answer: 'Recomendamos não armazenar arquivos importantes exclusivamente no OneDrive durante o teste. Faça backup periódico dos seus arquivos.'
  },
  {
    question: 'Funciona em Windows e Mac?',
    answer: 'Sim, conforme compatibilidade do plano e do sistema utilizado.'
  }
])

const openFaq = ref<number | null>(null)

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index
}

const buyNowUrl = '/checkout?product=microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="flex items-center gap-3">
          <img :src="logoPath" :alt="siteName" class="h-10 w-auto" />
          <span class="text-xl font-bold text-blue-600 hidden sm:block">{{ siteName }}</span>
        </a>
        <a href="/" class="text-gray-600 hover:text-blue-600">Voltar ao site</a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-16 md:py-20 px-4">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Teste o Office 365 por 7 dias antes de pagar
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Receba um acesso provisório, instale Word, Excel, PowerPoint e Outlook, e continue somente se gostar.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#solicitar" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
              Quero testar grátis por 7 dias
            </a>
            <a :href="buyNowUrl" class="inline-block bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold px-8 py-4 rounded-xl text-lg transition">
              Comprar agora
            </a>
          </div>

          <!-- Selos de confiança -->
          <div class="flex flex-wrap justify-center lg:justify-start gap-6 mt-12">
            <div class="flex items-center gap-2 text-gray-600">
              <span class="text-2xl">🚀</span>
              <span>Entrega rápida</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <span class="text-2xl">💬</span>
              <span>Suporte para instalação</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <span class="text-2xl">📅</span>
              <span>Teste por 7 dias</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <span class="text-2xl">💳</span>
              <span>Pagamento após aprovação</span>
            </div>
          </div>
        </div>
        <div class="hidden lg:block">
          <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div class="text-6xl mb-4">📊</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Microsoft 365</h3>
            <div class="space-y-3 text-gray-600">
              <div class="flex items-center gap-2">
                <span class="text-blue-600">✓</span>
                <span>Word</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">✓</span>
                <span>Excel</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">✓</span>
                <span>PowerPoint</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">✓</span>
                <span>Outlook</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-blue-600">✓</span>
                <span>OneDrive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Como funciona -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Como funciona</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Solicite o teste</h3>
            <p class="text-gray-600">Preencha o formulário com seus dados</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Receba o acesso</h3>
            <p class="text-gray-600">Enviamos as instruções por e-mail e WhatsApp</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Pague se gostar</h3>
            <p class="text-gray-600">Continue usando somente se aprovar</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefícios Microsoft 365 -->
    <section class="py-16 px-4 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Explore ainda mais os benefícios do Microsoft 365</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Segurança online -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">🔒</div>
            <h3 class="font-semibold text-gray-900 mb-2">Simplifique sua segurança online</h3>
            <p class="text-gray-600">Mantenha seus dispositivos mais protegidos com recursos de segurança, alertas e boas práticas para uso seguro no dia a dia.</p>
          </div>

          <!-- Aplicativos de produtividade -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">📊</div>
            <h3 class="font-semibold text-gray-900 mb-2">Aplicativos de produtividade poderosos</h3>
            <p class="text-gray-600">Use Word, Excel, PowerPoint, Outlook e outros aplicativos essenciais para trabalhar, estudar e organizar sua rotina.</p>
          </div>

          <!-- Armazenamento em nuvem -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">☁️</div>
            <h3 class="font-semibold text-gray-900 mb-2">Armazenamento para seus arquivos</h3>
            <p class="text-gray-600">Salve, compartilhe e acesse documentos importantes com mais praticidade. Recomendamos manter backup periódico dos arquivos.</p>
          </div>

          <!-- Outlook -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">📧</div>
            <h3 class="font-semibold text-gray-900 mb-2">Aproveite melhor seu dia com o Outlook</h3>
            <p class="text-gray-600">Organize e-mails, compromissos e tarefas em uma experiência integrada para ganhar produtividade.</p>
          </div>

          <!-- OneNote -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">📝</div>
            <h3 class="font-semibold text-gray-900 mb-2">Todas as suas ideias em um único lugar</h3>
            <p class="text-gray-600">Crie anotações, organize ideias, listas, projetos e informações importantes em um só lugar.</p>
          </div>

          <!-- Criação de conteúdo -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="text-3xl mb-3">🎨</div>
            <h3 class="font-semibold text-gray-900 mb-2">Conte sua história do seu jeito</h3>
            <p class="text-gray-600">Crie apresentações, documentos e conteúdos visuais com ferramentas práticas para o dia a dia.</p>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-12 text-center">
          <p class="text-xl text-gray-600 mb-8">
            Teste agora por 7 dias ou compre seu acesso imediatamente.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#solicitar" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
              Quero testar grátis
            </a>
            <a :href="buyNowUrl" class="inline-block bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold px-8 py-4 rounded-xl text-lg transition">
              Comprar agora
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Formulário -->
    <section id="solicitar" class="py-16 px-4 bg-white">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Solicitar teste grátis</h2>
        
        <!-- Mensagem de sucesso -->
        <div v-if="success" class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div class="flex items-center gap-3">
            <span class="text-2xl">✅</span>
            <p class="text-green-800 font-medium">
              Solicitação recebida. Enviaremos as instruções de acesso no seu e-mail e WhatsApp.
            </p>
          </div>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div class="flex items-center gap-3">
            <span class="text-2xl">❌</span>
            <p class="text-red-800 font-medium">{{ error }}</p>
          </div>
        </div>

        <!-- Formulário -->
        <form v-if="!success" @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label class="block font-medium text-gray-900 mb-2">Nome completo</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-900 mb-2">E-mail</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-900 mb-2">WhatsApp</label>
            <input
              v-model="formData.whatsapp"
              type="tel"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-900 mb-2">Tipo de uso</label>
            <select
              v-model="formData.usageType"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione</option>
              <option value="pessoal">Pessoal</option>
              <option value="empresa">Empresa</option>
              <option value="estudante">Estudante</option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-gray-900 mb-2">Sistema operacional</label>
            <select
              v-model="formData.systemType"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione</option>
              <option value="Windows">Windows</option>
              <option value="Mac">Mac</option>
            </select>
          </div>

          <div class="flex items-start gap-3">
            <input
              v-model="formData.acceptTerms"
              type="checkbox"
              required
              id="terms"
              class="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="terms" class="text-sm text-gray-600">
              Concordo com os termos e condições do teste. Entendo que este é um teste promocional da Casa do Software e não um trial oficial da Microsoft.
            </label>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            {{ loading ? 'Enviando...' : 'Receber meu acesso de teste' }}
          </button>
        </form>

        <!-- Aviso importante -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <h4 class="font-semibold text-yellow-800 mb-2">Aviso importante</h4>
              <p class="text-yellow-700 text-sm">
                Esta oferta é uma condição promocional da Casa do Software e não representa um trial oficial da Microsoft. O acesso é temporário por 7 dias e poderá ser encerrado caso não haja pagamento. Recomendamos não armazenar arquivos importantes exclusivamente no OneDrive durante o teste.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 px-4 bg-blue-50">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Perguntas frequentes</h2>
        <div class="space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
            >
              <span class="font-semibold text-gray-900">{{ faq.question }}</span>
              <span class="text-gray-500">
                {{ openFaq === index ? '−' : '+' }}
              </span>
            </button>
            <div v-if="openFaq === index" class="px-6 pb-4 text-gray-600">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Pronto para testar?</h2>
        <p class="text-xl text-gray-600 mb-8">
          Solicite seu teste grátis agora e experimente o Office 365 por 7 dias sem compromisso.
        </p>
        <a href="#solicitar" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
          Quero testar grátis por 7 dias
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <p class="text-gray-400">© 2026 Casa do Software. Todos os direitos reservados.</p>
        <p class="text-gray-500 text-sm mt-2">
          Esta é uma oferta promocional da Casa do Software e não está afiliada à Microsoft Corporation.
        </p>
      </div>
    </footer>
  </div>
</template>
