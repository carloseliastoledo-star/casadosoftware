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
        <ul class="text-sm space-y-2">
          <li>
            <NuxtLink :to="refundPolicyPath" class="text-blue-600 hover:underline">{{ t.refundPolicy }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="privacyPolicyPath" class="text-blue-600 hover:underline">{{ t.privacyPolicy }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="termsOfUsePath" class="text-blue-600 hover:underline">{{ t.termsOfUse }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section4Title }}</h2>
        <p class="text-sm">
          {{ t.section4Prefix }}
          <a class="text-blue-600 hover:underline" :href="mailtoSupport">{{ supportEmail }}</a>
          {{ t.section4Suffix }}
        </p>
      </div>

      <p v-if="intl.language.value === 'pt'" class="text-sm text-gray-600">
        Razão Social: {{ companyLegalName }} — CNPJ: {{ companyCnpj }}.
      </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { supportEmail, siteName, companyLegalName, companyCnpj } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const isIntlDomain = computed(() => intl.currencyLower.value !== 'brl')

const refundPolicyPath = computed(() => intl.language.value === 'en' ? '/refund-policy' : '/reembolso')
const privacyPolicyPath = computed(() => intl.language.value === 'en' ? '/privacy' : '/privacidade')
const termsOfUsePath = computed(() => intl.language.value === 'en' ? '/terms' : '/termos')

const t = computed(() => {
  const lang = intl.language.value
  const effectiveLang = (isIntlDomain.value && lang === 'pt') ? 'en' : lang

  if (effectiveLang === 'en') {
    return {
      title: 'Legal Notice',
      intro: 'This page contains important legal information about our business.',
      section1Title: 'Independent Store',
      section1Body: 'Casa do Software is an independent store specialized in digital licenses and software solutions. We are not affiliated, official representatives or owned by Microsoft, Autodesk or other brands mentioned on this site. All trademarks belong to their respective owners.',
      section2Title: 'Brand Usage',
      section2Body: 'Brand names mentioned on this site are used only to identify the products sold. No affiliation or endorsement by the brand owners is implied or should be inferred.',
      section3Title: 'Related Policies',
      refundPolicy: 'Refund Policy',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      section4Title: 'Contact',
      section4Prefix: 'For questions, contact us by email ',
      section4Suffix: '.'
    }
  }

  if (effectiveLang === 'es') {
    return {
      title: 'Aviso Legal',
      intro: 'Esta página contiene información legal importante sobre nuestro negocio.',
      section1Title: 'Tienda Independiente',
      section1Body: 'Casa do Software es una tienda independiente especializada en licencias digitales y soluciones de software. No somos afiliados, representantes oficiales o propiedad de Microsoft, Autodesk u otras marcas mencionadas en este sitio. Todas las marcas pertenecen a sus respectivos propietarios.',
      section2Title: 'Uso de Marcas',
      section2Body: 'Los nombres de marcas mencionados en este sitio se utilizan solo para identificar los productos vendidos. No se implica ni debe inferirse ninguna afiliación o respaldo por parte de los propietarios de las marcas.',
      section3Title: 'Políticas Relacionadas',
      refundPolicy: 'Política de Reembolso',
      privacyPolicy: 'Política de Privacidad',
      termsOfUse: 'Términos de Uso',
      section4Title: 'Contacto',
      section4Prefix: 'Para preguntas, contáctenos por e-mail ',
      section4Suffix: '.'
    }
  }

  if (effectiveLang === 'fr') {
    return {
      title: 'Avis Légal',
      intro: 'Cette page contient des informations juridiques importantes sur notre entreprise.',
      section1Title: 'Magasin Indépendant',
      section1Body: 'Casa do Software est un magasin indépendant spécialisé dans les licences numériques et les solutions logicielles. Nous ne sommes pas affiliés, représentants officiels ou propriétaires de Microsoft, Autodesk ou autres marques mentionnées sur ce site. Toutes les marques appartiennent à leurs propriétaires respectifs.',
      section2Title: 'Utilisation des Marques',
      section2Body: 'Les noms de marques mentionnés sur ce site sont utilisés uniquement pour identifier les produits vendus. Aucune affiliation ou approbation par les propriétaires des marques n\'est impliquée ou ne doit être déduite.',
      section3Title: 'Politiques Connexes',
      refundPolicy: 'Politique de Remboursement',
      privacyPolicy: 'Politique de Confidentialité',
      termsOfUse: 'Conditions d\'Utilisation',
      section4Title: 'Contact',
      section4Prefix: 'Pour toute question, contactez-nous par e-mail ',
      section4Suffix: '.'
    }
  }

  return {
    title: 'Aviso Legal',
    intro: 'Esta página contém informações legais importantes sobre nosso negócio.',
    section1Title: 'Loja Independente',
    section1Body: 'Casa do Software é uma loja independente especializada em licenças digitais e soluções de software. Não somos afiliados, representantes oficiais ou propriedade da Microsoft, Autodesk ou outras marcas mencionadas neste site. Todas as marcas pertencem aos seus respectivos proprietários.',
    section2Title: 'Uso de Marcas',
    section2Body: 'Os nomes das marcas mencionadas neste site são usados apenas para identificar os produtos comercializados. Não há filiação ou endosso pelos proprietários das marcas, nem deve ser inferido.',
    section3Title: 'Políticas Relacionadas',
    refundPolicy: 'Política de Reembolso',
    privacyPolicy: 'Política de Privacidade',
    termsOfUse: 'Termos de Uso',
    section4Title: 'Contato',
    section4Prefix: 'Para dúvidas, entre em contato pelo e-mail ',
    section4Suffix: '.'
  }
})

const mailtoSupport = computed(() => {
  const email = String(supportEmail || '').trim()
  return email ? `mailto:${email}` : 'mailto:'
})

useSeoMeta({
  title: `${t.value.title} | ${siteName}`
})

const canonicalPath = computed(() => {
  return intl.language.value === 'en' ? '/legal-notice' : '/aviso-legal'
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}${canonicalPath.value}` }] : []
}))
</script>
