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
        <ul class="text-sm list-disc pl-5 space-y-2">
          <li>{{ t.section2Item1 }}</li>
          <li>{{ t.section2Item2 }}</li>
          <li>{{ t.section2Item3 }}</li>
        </ul>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section3Title }}</h2>
        <p class="text-sm">
          {{ t.section3Prefix }}
          <a class="text-blue-600 hover:underline" :href="mailtoSupport">{{ supportEmail }}</a>
          {{ t.section3Suffix }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section4Title }}</h2>
        <p class="text-sm">
          {{ t.section4Body }}
        </p>
      </div>

      <p class="text-sm text-gray-600">
        ELETROKEYS LTDA — CNPJ 44.694.356/0001-48.
      </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { supportEmail, siteName } = useSiteBranding()
const intl = useIntlContext()
const baseUrl = useSiteUrl()

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      title: 'Refund policy',
      intro: 'This policy describes the refund conditions for digital products purchased on this website.',
      section1Title: '1. Digital product',
      section1Body: 'As this is a digital product, the refund may depend on delivery status and use of the digital content.',
      section2Title: '2. When we evaluate a refund',
      section2Item1: 'Delivery failure after support and attempted resolution.',
      section2Item2: 'Proven incompatibility with requirements stated on the product page.',
      section2Item3: 'Duplicate charge or operational error.',
      section3Title: '3. How to request',
      section3Prefix: 'Contact us by email ',
      section3Suffix: ' informing your order number and the reason.',
      section4Title: '4. Timeframe',
      section4Body: 'We will respond within up to 2 business days, and refund processing time depends on the payment method.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Política de reembolso',
      intro: 'Esta política describe las condiciones de reembolso para productos digitales adquiridos en este sitio.',
      section1Title: '1. Producto digital',
      section1Body: 'Al tratarse de un producto digital, el reembolso puede depender del estado de entrega y del uso del contenido digital.',
      section2Title: '2. Cuándo evaluamos un reembolso',
      section2Item1: 'Fallo de entrega tras soporte e intento de solución.',
      section2Item2: 'Incompatibilidad comprobada con los requisitos informados en la página del producto.',
      section2Item3: 'Cobro duplicado o error operativo.',
      section3Title: '3. Cómo solicitar',
      section3Prefix: 'Ponte en contacto por e-mail ',
      section3Suffix: ' indicando el número del pedido y el motivo.',
      section4Title: '4. Plazo',
      section4Body: 'Responderemos tu solicitud en hasta 2 días hábiles, y el plazo de procesamiento del reembolso depende del medio de pago.'
    }
  }

  return {
    title: 'Política de Reembolso',
    intro: 'Esta política descreve as condições de reembolso para produtos digitais adquiridos neste site.',
    section1Title: '1. Produto digital',
    section1Body: 'Por se tratar de produto digital, o reembolso pode depender do status de entrega e do uso do conteúdo digital.',
    section2Title: '2. Quando avaliamos reembolso',
    section2Item1: 'Falha de entrega após suporte e tentativa de solução.',
    section2Item2: 'Incompatibilidade comprovada com requisitos informados na página do produto.',
    section2Item3: 'Cobrança duplicada ou erro operacional.',
    section3Title: '3. Como solicitar',
    section3Prefix: 'Entre em contato pelo e-mail ',
    section3Suffix: ' informando o número do pedido e o motivo.',
    section4Title: '4. Prazo',
    section4Body: 'Responderemos sua solicitação em até 2 dias úteis, e o prazo de processamento do reembolso depende do meio de pagamento.'
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
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/reembolso` }] : []
}))
</script>
