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
          {{ t.section5Prefix }}
          <a class="text-blue-600 hover:underline" :href="mailtoSupport">{{ supportEmail }}</a>
        </p>
        <p class="text-sm">
          ELETROKEYS LTDA — CNPJ 44.694.356/0001-48.
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

const { supportEmail, siteName } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'Privacy policy',
      intro: 'This policy describes how we collect and use information when browsing and purchasing on this website.',
      section1Title: '1. Collected data',
      section1Body:
        'We may collect data provided by you during registration and purchase, such as name, email and information necessary to issue and deliver the order.',
      section2Title: '2. Purpose',
      section2Body: 'We use data to process orders, provide support, prevent fraud and improve the user experience.',
      section3Title: '3. Cookies and analytics',
      section3Body: 'We may use cookies and similar technologies for functionality, statistics and service improvements.',
      section4Title: '4. Sharing',
      section4Body:
        'We do not sell your data. We may share information only when necessary to process payments, comply with legal obligations or protect rights.',
      section5Title: '5. Contact',
      section5Prefix: 'For privacy-related requests: ',
      footerNote: 'This policy may be updated.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Política de privacidad',
      intro: 'Esta política describe cómo recopilamos y utilizamos información al navegar y comprar en este sitio.',
      section1Title: '1. Datos recopilados',
      section1Body:
        'Podemos recopilar datos proporcionados por ti durante el registro y la compra, como nombre, e-mail e información necesaria para la emisión y entrega del pedido.',
      section2Title: '2. Finalidad',
      section2Body: 'Utilizamos los datos para procesar pedidos, brindar soporte, prevenir fraudes y mejorar la experiencia del usuario.',
      section3Title: '3. Cookies y medición',
      section3Body: 'Podemos utilizar cookies y tecnologías similares para funcionamiento, estadísticas y mejora del servicio.',
      section4Title: '4. Compartición',
      section4Body:
        'No vendemos tus datos. Podemos compartir información solo cuando sea necesario para procesar pagos, cumplir obligaciones legales o proteger derechos.',
      section5Title: '5. Contacto',
      section5Prefix: 'Para solicitudes relacionadas con la privacidad: ',
      footerNote: 'Esta política puede ser actualizada.'
    }
  }

  return {
    title: 'Política de Privacidade',
    intro: 'Esta política descreve como coletamos e utilizamos informações ao navegar e comprar neste site.',
    section1Title: '1. Dados coletados',
    section1Body:
      'Podemos coletar dados fornecidos por você no cadastro e na compra, como nome, e-mail e informações necessárias para emissão e entrega do pedido.',
    section2Title: '2. Finalidade',
    section2Body: 'Utilizamos os dados para processar pedidos, fornecer suporte, prevenir fraudes e melhorar a experiência do usuário.',
    section3Title: '3. Cookies e medição',
    section3Body: 'Podemos utilizar cookies e tecnologias similares para funcionamento, estatísticas e melhoria do serviço.',
    section4Title: '4. Compartilhamento',
    section4Body:
      'Não vendemos seus dados. Podemos compartilhar informações apenas quando necessário para processar pagamentos, cumprir obrigações legais ou proteger direitos.',
    section5Title: '5. Contato',
    section5Prefix: 'Para solicitações relacionadas a privacidade: ',
    footerNote: 'Esta política pode ser atualizada.'
  }
})

const mailtoSupport = computed(() => {
  const email = String(supportEmail || '').trim()
  return email ? `mailto:${email}` : 'mailto:'
})

useSeoMeta({
  title: `${t.value.title} | ${siteName}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/privacidade` }] : []
}))
</script>
