<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 class="text-3xl font-extrabold text-gray-900">{{ t.title }}</h1>

        <div class="mt-6 space-y-4 text-gray-700 leading-relaxed">
      <p>
        {{ t.intro }}
      </p>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section1Title }}</h2>
        <p class="text-sm">
          {{ t.section1Body }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section2Title }}</h2>
        <p class="text-sm">
          {{ t.section2Body }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section3Title }}</h2>
        <p class="text-sm">
          {{ t.section3Body }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section4Title }}</h2>
        <p class="text-sm">
          {{ t.section4Body }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section5Title }}</h2>
        <p class="text-sm">
          MERCADO SOFTWARES LTDA — CNPJ 60.292.316/0001-26.
        </p>
      </div>

      <p class="text-sm text-gray-600">
        {{ t.footerNote }}
      </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' as any })

const { siteName } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'Terms of use',
      intro: 'By accessing and using this website, you agree to the terms and conditions described below.',
      section1Title: '1. Digital products',
      section1Body: 'The products sold are digital. Delivery conditions, instructions and requirements are described on the product page.',
      section2Title: '2. Proper use',
      section2Body: 'You agree to provide truthful information at the time of purchase and to use the website lawfully.',
      section3Title: '3. Support',
      section3Body: 'We provide support for questions related to delivery and usage of the product, through the informed channels.',
      section4Title: '4. Intellectual property',
      section4Body: 'Trademarks, trade names and logos mentioned belong to their respective owners.',
      section5Title: '5. Company',
      footerNote: 'These terms may be updated periodically.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Términos de uso',
      intro: 'Al acceder y utilizar este sitio, aceptas los términos y condiciones descritos a continuación.',
      section1Title: '1. Productos digitales',
      section1Body: 'Los productos comercializados son digitales. Las condiciones de entrega, instrucciones y requisitos se indican en la página del producto.',
      section2Title: '2. Uso correcto',
      section2Body: 'Te comprometes a proporcionar información veraz en el momento de la compra y a utilizar el sitio de forma lícita.',
      section3Title: '3. Soporte',
      section3Body: 'Ofrecemos soporte para dudas relacionadas con la entrega y el uso del producto, según el canal informado.',
      section4Title: '4. Propiedad intelectual',
      section4Body: 'Marcas, nombres comerciales y logotipos citados pertenecen a sus respectivos propietarios.',
      section5Title: '5. Empresa',
      footerNote: 'Estos términos pueden actualizarse periódicamente.'
    }
  }

  return {
    title: 'Termos de Uso',
    intro: 'Ao acessar e utilizar este site, você concorda com os termos e condições descritos abaixo.',
    section1Title: '1. Produtos digitais',
    section1Body: 'Os produtos comercializados são digitais. As condições de entrega, instruções e requisitos constam na página do produto.',
    section2Title: '2. Uso correto',
    section2Body: 'Você se compromete a fornecer informações verdadeiras no momento da compra e a utilizar o site de forma lícita.',
    section3Title: '3. Suporte',
    section3Body: 'Oferecemos suporte para dúvidas relacionadas à entrega e utilização do produto, conforme o canal informado.',
    section4Title: '4. Propriedade intelectual',
    section4Body: 'Marcas, nomes comerciais e logotipos citados pertencem aos seus respectivos proprietários.',
    section5Title: '5. Empresa',
    footerNote: 'Estes termos podem ser atualizados periodicamente.'
  }
})

useSeoMeta({
  title: `${t.value.title} | ${siteName}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/termos` }] : []
}))
</script>
