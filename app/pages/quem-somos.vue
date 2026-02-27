<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 class="text-3xl font-extrabold text-gray-900">{{ t.title }}</h1>

        <div class="mt-6 space-y-4 text-gray-700 leading-relaxed">
      <p>
        {{ t.intro }}
      </p>

      <div class="rounded-xl border bg-white p-5">
        <h2 class="text-xl font-bold text-gray-900">{{ t.companyDataTitle }}</h2>
        <div class="mt-3 space-y-1 text-sm text-gray-700">
          <p><span class="font-semibold">{{ t.companyLabel }}</span> {{ companyLegalName }}</p>
          <p><span class="font-semibold">Endereço:</span> {{ companyAddress }}</p>
          <p><span class="font-semibold">Telefone/Whatsapp:</span> {{ companyPhone }}</p>
          <p><span class="font-semibold">E-mail:</span> {{ companyEmail }}</p>
        </div>
      </div>

      <div class="rounded-xl border bg-white p-5">
        <h2 class="text-xl font-bold text-gray-900">{{ t.contactTitle }}</h2>
        <div class="mt-3 space-y-1 text-sm text-gray-700">
          <p>
            <span class="font-semibold">{{ t.emailLabel }}</span>
            <a class="text-blue-600 hover:underline" :href="mailtoSupport">{{ supportEmail }}</a>
          </p>
          <p><span class="font-semibold">{{ t.supportHoursLabel }}</span> {{ t.supportHoursBody }}</p>
        </div>
      </div>

      <div class="rounded-xl border bg-white p-5">
        <h2 class="text-xl font-bold text-gray-900">{{ t.productsTitle }}</h2>
        <div class="mt-3 space-y-2 text-sm text-gray-700">
          <p>
            {{ t.productsP1 }}
          </p>
          <p>
            {{ t.productsP2 }}
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteName, supportEmail, companyLegalName, companyAddress, companyPhone, companyEmail } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const safeSiteName = computed(() => {
  const n = String(siteName || '').trim()
  return n || 'Mercado Softwares'
})

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'About us',
      intro: `${safeSiteName.value} is an online store focused on selling digital products and software licenses, with delivery and support.`,
      companyDataTitle: 'Company details',
      companyLabel: 'Company:',
      contactTitle: 'Contact and support',
      emailLabel: 'Email:',
      supportHoursLabel: 'Support:',
      supportHoursBody: 'during business hours.',
      productsTitle: 'About the products',
      productsP1: 'The products available on this website are digital. Delivery may occur by email and/or through the customer area, as described on each product page.',
      productsP2: 'The mentioned brands and product names belong to their respective owners.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Quiénes somos',
      intro:
        'Somos una empresa especializada en licencias digitales y soluciones tecnológicas. Trabajamos con enfoque en transparencia, legalidad y soporte al cliente, ofreciendo orientación clara sobre activación y uso de software con licencia.',
      companyDataTitle: 'Sobre la empresa',
      companyLabel: 'Empresa:',
      contactTitle: 'Forma de atención',
      emailLabel: 'Email:',
      supportHoursLabel: 'Atención:',
      supportHoursBody: 'en horario comercial.',
      productsTitle: 'Sobre los productos',
      productsP1: 'Los productos disponibles en este sitio son digitales. La entrega puede realizarse por correo y/o mediante el área del cliente, según se describe en la página de cada producto.',
      productsP2: 'Las marcas y nombres de productos mencionados pertenecen a sus respectivos propietarios.'
    }
  }

  return {
    title: 'Quem somos',
    intro:
      `${safeSiteName.value} é uma empresa brasileira especializada em licenças digitais e soluções em tecnologia. Atuamos com foco em transparência, legalidade e suporte ao cliente, oferecendo orientações claras sobre ativação e utilização de softwares licenciados.`,
    companyDataTitle: 'Sobre a Empresa',
    companyLabel: 'Empresa:',
    contactTitle: 'Forma de Atendimento',
    emailLabel: 'E-mail:',
    supportHoursLabel: 'Atendimento:',
    supportHoursBody:
      'Nosso atendimento é realizado por meio de e-mail e canais digitais, onde prestamos suporte informativo, esclarecimento de dúvidas e orientações relacionadas às licenças digitais e utilização dos softwares.',
    productsTitle: 'O que Oferecemos',
    productsP1:
      'Licenças Digitais Originais de Software; Orientações de Ativação e Instalação; Suporte ao Cliente; Informações institucionais e políticas públicas; Consultoria básica sobre utilização de softwares e serviços em nuvem.',
    productsP2:
      'Atendemos usuários finais, profissionais autônomos e pequenas e médias empresas que necessitam de softwares originais, orientações de ativação e suporte técnico básico para instalação e utilização.'
  }
})

const mailtoSupport = computed(() => {
  const email = String(supportEmail || '').trim()
  return email ? `mailto:${email}` : 'mailto:'
})

const seoTitle = computed(() => `${t.value.title} | ${safeSiteName.value}`)
useSeoMeta({
  title: seoTitle,
  description: '',
  ogTitle: seoTitle,
  ogDescription: '',
  twitterTitle: seoTitle,
  twitterDescription: ''
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/quem-somos` }] : []
}))
</script>
