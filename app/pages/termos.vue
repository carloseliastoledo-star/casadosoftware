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
        <p v-if="intl.language.value === 'pt'" class="text-sm">
          Razão Social: Softwares Mundi LTDA — CNPJ: 66.464.267/0001-48.
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

const { siteName } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const isIntlDomain = computed(() => intl.currencyLower.value !== 'brl')

const t = computed(() => {
  const lang = intl.language.value
  const effectiveLang = (isIntlDomain.value && lang === 'pt') ? 'en' : lang

  if (effectiveLang === 'en') {
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

  if (effectiveLang === 'es') {
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

  if (effectiveLang === 'fr') {
    return {
      title: 'Conditions d\'utilisation',
      intro: 'En accédant à ce site et en l\'utilisant, vous acceptez les termes et conditions décrits ci-dessous.',
      section1Title: '1. Produits numériques',
      section1Body: 'Les produits vendus sont numériques. Les conditions de livraison, instructions et prérequis sont décrits sur la page du produit.',
      section2Title: '2. Utilisation correcte',
      section2Body: 'Vous vous engagez à fournir des informations exactes lors de l\'achat et à utiliser le site de manière licite.',
      section3Title: '3. Support',
      section3Body: 'Nous fournissons un support pour les questions liées à la livraison et à l\'utilisation du produit.',
      section4Title: '4. Propriété intellectuelle',
      section4Body: 'Les marques, noms commerciaux et logos mentionnés appartiennent à leurs propriétaires respectifs.',
      section5Title: '5. Société',
      footerNote: 'Ces conditions peuvent être mises à jour périodiquement.'
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

const canonicalPath = computed(() => {
  return intl.language.value === 'en' ? '/terms-of-use' : '/termos'
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}${canonicalPath.value}` }] : []
}))
</script>
