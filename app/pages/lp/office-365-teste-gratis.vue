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
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <a href="/" class="flex items-center">
          <img :src="logoPath" :alt="siteName" class="h-14 w-auto" />
        </a>
        <a href="/" class="text-gray-600 hover:text-blue-600 font-medium">Voltar ao site</a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-20 md:py-24 px-4">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <!-- Badge -->
          <div class="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span class="mr-2">✓</span>
            Teste grátis por 7 dias
          </div>

          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Teste o Office 365 por 7 dias antes de pagar
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-xl">
            Receba acesso provisório, instale Word, Excel, PowerPoint e Outlook, e continue somente se gostar.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-start">
            <a href="#solicitar" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition text-center">
              Quero testar grátis por 7 dias
            </a>
            <a :href="buyNowUrl" class="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition text-center">
              Comprar agora
            </a>
          </div>

          <!-- Selos de confiança -->
          <div class="flex flex-wrap gap-6 mt-12">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-blue-600">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Entrega rápida</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-green-600">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Suporte para instalação</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-purple-600">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Teste por 7 dias</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-orange-600">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Pagamento após aprovação</span>
            </div>
          </div>
        </div>
        <div class="hidden lg:block">
          <div class="relative">
            <!-- Blur de fundo -->
            <div class="absolute -inset-8 bg-blue-200/40 rounded-full blur-3xl"></div>
            
            <!-- Imagem do produto -->
            <div class="relative">
              <img 
                src="https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/1779226072333-office-365-premium.webp" 
                alt="Microsoft Office 365 com Word, Excel, PowerPoint e Outlook"
                class="w-full h-auto rounded-3xl shadow-2xl border border-blue-100"
              />
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
    <section class="py-20 md:py-24 px-4 bg-[#f5f5f5]">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">Explore ainda mais os benefícios do Microsoft 365</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-14">
          <!-- Segurança online -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill="#0078D4"/>
                <path d="M12 6L5 9.5V14.5L12 18L19 14.5V9.5L12 6Z" fill="white" fill-opacity="0.3"/>
                <path d="M12 10L8 12.5V15L12 17L16 14.5V12.5L12 10Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Simplifique sua segurança online</h3>
              <p class="text-gray-700 text-base leading-relaxed">Mantenha seus dispositivos mais protegidos com recursos de segurança, alertas e boas práticas para uso seguro no dia a dia.</p>
            </div>
          </div>

          <!-- Aplicativos de produtividade -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <rect x="2" y="3" width="20" height="18" rx="2" fill="#0078D4"/>
                <path d="M7 8H17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M7 12H17" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M7 16H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Aplicativos de produtividade poderosos</h3>
              <p class="text-gray-700 text-base leading-relaxed">Use Word, Excel, PowerPoint, Outlook e outros aplicativos essenciais para trabalhar, estudar e organizar sua rotina.</p>
            </div>
          </div>

          <!-- Armazenamento em nuvem -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <path d="M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10C20 5.58 16.42 2 12 2Z" fill="#0078D4" fill-opacity="0.2"/>
                <path d="M12 4C8.69 4 6 6.69 6 10C6 13.31 8.69 16 12 16C15.31 16 18 13.31 18 10C18 6.69 15.31 4 12 4Z" fill="#0078D4"/>
                <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Armazenamento para seus arquivos</h3>
              <p class="text-gray-700 text-base leading-relaxed">Salve, compartilhe e acesse documentos importantes com mais praticidade. Recomendamos manter backup periódico dos arquivos.</p>
            </div>
          </div>

          <!-- Outlook -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="#0078D4"/>
                <rect x="3" y="5" width="18" height="4" fill="#005A9E"/>
                <circle cx="9" cy="12" r="1.5" fill="white"/>
                <circle cx="15" cy="12" r="1.5" fill="white"/>
                <path d="M7 16H17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Aproveite melhor seu dia com o Outlook</h3>
              <p class="text-gray-700 text-base leading-relaxed">Organize e-mails, compromissos e tarefas em uma experiência integrada para ganhar produtividade.</p>
            </div>
          </div>

          <!-- OneNote -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <rect x="4" y="3" width="16" height="18" rx="2" fill="#7719AA"/>
                <rect x="6" y="5" width="12" height="2" fill="white" fill-opacity="0.5"/>
                <rect x="6" y="8" width="8" height="1" fill="white" fill-opacity="0.3"/>
                <rect x="6" y="10" width="10" height="1" fill="white" fill-opacity="0.3"/>
                <rect x="6" y="12" width="7" height="1" fill="white" fill-opacity="0.3"/>
                <rect x="6" y="14" width="9" height="1" fill="white" fill-opacity="0.3"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Todas as suas ideias em um único lugar</h3>
              <p class="text-gray-700 text-base leading-relaxed">Crie anotações, organize ideias, listas, projetos e informações importantes em um só lugar.</p>
            </div>
          </div>

          <!-- Criação de conteúdo -->
          <div class="flex items-start gap-6">
            <div class="w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
                <rect x="4" y="3" width="16" height="18" rx="2" fill="#C43E1C"/>
                <rect x="7" y="6" width="10" height="8" fill="white" fill-opacity="0.3"/>
                <circle cx="9" cy="8" r="1" fill="white"/>
                <circle cx="15" cy="8" r="1" fill="white"/>
                <circle cx="9" cy="12" r="1" fill="white"/>
                <circle cx="15" cy="12" r="1" fill="white"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">Conte sua história do seu jeito</h3>
              <p class="text-gray-700 text-base leading-relaxed">Crie apresentações, documentos e conteúdos visuais com ferramentas práticas para o dia a dia.</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-20 text-center">
          <p class="text-lg text-gray-600 mb-6">
            Teste por 7 dias ou compre seu acesso imediatamente.
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
