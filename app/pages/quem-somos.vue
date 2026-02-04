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
          <p><span class="font-semibold">{{ t.companyLabel }}</span> Eletrokeys LTDA</p>
          <p><span class="font-semibold">{{ t.companyTaxIdLabel }}</span> 44.694.365/0001-48</p>
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
const { siteName, supportEmail } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const safeSiteName = computed(() => {
  const n = String(siteName.value || '').trim()
  return n || 'Licenças Digitais'
})

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'About us',
      intro: `${safeSiteName.value} is an online store focused on selling digital products and software licenses, with delivery and support.`,
      companyDataTitle: 'Company details',
      companyLabel: 'Company:',
      companyTaxIdLabel: 'Tax ID:',
      contactTitle: 'Contact and support',
      emailLabel: 'Email:',
      supportHoursLabel: 'Support:',
      supportHoursBody: 'business hours.',
      productsTitle: 'About the products',
      productsP1: 'The products available on this website are digital. Delivery can happen by email and/or through the customer area, as described on each product page.',
      productsP2: 'Brands and product names mentioned belong to their respective owners.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Quiénes somos',
      intro: `${safeSiteName.value} es una tienda online enfocada en la venta de productos digitales y licencias de software, con entrega y suporte.`,
      companyDataTitle: 'Datos de la empresa',
      companyLabel: 'Empresa:',
      companyTaxIdLabel: 'CIF/CNPJ:',
      contactTitle: 'Contacto y soporte',
      emailLabel: 'Correo:',
      supportHoursLabel: 'Atención:',
      supportHoursBody: 'en horario comercial.',
      productsTitle: 'Sobre los productos',
      productsP1: 'Los productos disponibles en este sitio son digitales. La entrega puede realizarse por correo y/o mediante el área del cliente, según se describe en la página de cada producto.',
      productsP2: 'Las marcas y nombres de productos mencionados pertenecen a sus respectivos propietarios.'
    }
  }

  return {
    title: 'Quem Somos',
    intro: `${safeSiteName.value} é uma loja online focada na venda de produtos digitais e licenças de software, com entrega e suporte.`,
    companyDataTitle: 'Dados da empresa',
    companyLabel: 'Empresa:',
    companyTaxIdLabel: 'CNPJ:',
    contactTitle: 'Contato e suporte',
    emailLabel: 'E-mail:',
    supportHoursLabel: 'Atendimento:',
    supportHoursBody: 'em horário comercial.',
    productsTitle: 'Sobre os produtos',
    productsP1:
      'Os produtos disponibilizados neste site são digitais. A entrega pode ocorrer por e-mail e/ou disponibilização em área do cliente, conforme descrito na página de cada produto.',
    productsP2: 'Marcas e nomes de produtos mencionados pertencem aos seus respectivos proprietários.'
  }
})

const mailtoSupport = computed(() => {
  const email = String(supportEmail.value || '').trim()
  return email ? `mailto:${email}` : 'mailto:'
})

useSeoMeta({
  title: `${t.value.title} | ${safeSiteName.value}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/quem-somos` }] : []
}))
</script>
