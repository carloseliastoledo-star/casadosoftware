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
          <li>{{ t.section2Item4 }}</li>
        </ul>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section3Title }}</h2>
        <ul class="text-sm list-disc pl-5 space-y-2">
          <li>{{ t.section3Item1 }}</li>
          <li>{{ t.section3Item2 }}</li>
          <li>{{ t.section3Item3 }}</li>
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

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section5Title }}</h2>
        <p class="text-sm">
          {{ t.section5Body }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.section6Title }}</h2>
        <p class="text-sm">
          {{ t.section6Body }}
        </p>
      </div>

      <p v-if="intl.language.value === 'pt'" class="text-sm text-gray-600">
        Razão Social: Softwares Mundi LTDA — CNPJ: 66.464.267/0001-48.
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

const isIntlDomain = computed(() => intl.currencyLower.value !== 'brl')

const t = computed(() => {
  const lang = intl.language.value
  const effectiveLang = (isIntlDomain.value && lang === 'pt') ? 'en' : lang

  if (effectiveLang === 'en') {
    return {
      title: 'Refund policy',
      intro: 'This policy describes the refund conditions for digital products purchased on this website.',
      section1Title: '1. Digital product',
      section1Body: 'As this is a digital product, the refund may depend on delivery status and use of the digital content.',
      section2Title: '2. When we evaluate a refund',
      section2Item1: 'Delivery failure after support and attempted resolution.',
      section2Item2: 'Proven incompatibility with requirements stated on the product page.',
      section2Item3: 'Duplicate charge or operational error.',
      section2Item4: 'Product activation failure after support provided.',
      section3Title: '3. When refund is not available',
      section3Item1: 'Product already activated or used.',
      section3Item2: 'Change of mind after delivery.',
      section3Item3: 'Incompatibility not reported before activation.',
      section4Title: '4. How to request',
      section4Prefix: 'Contact us by email ',
      section4Suffix: ' informing your order number, product name and reason for the request.',
      section5Title: '5. Response time',
      section5Body: 'We will respond within up to 2 business days. If approved, refund processing time depends on the payment method.',
      section6Title: '6. After activation',
      section6Body: 'Once the license is activated, refund is only available in case of proven technical failure that cannot be resolved by our support team.'
    }
  }

  if (effectiveLang === 'es') {
    return {
      title: 'Política de reembolso',
      intro: 'Esta política describe las condiciones de reembolso para productos digitales adquiridos en este sitio.',
      section1Title: '1. Producto digital',
      section1Body: 'Al tratarse de un producto digital, el reembolso puede depender del estado de entrega y del uso del contenido digital.',
      section2Title: '2. Cuándo evaluamos un reembolso',
      section2Item1: 'Fallo de entrega tras soporte e intento de solución.',
      section2Item2: 'Incompatibilidad comprobada con los requisitos informados en la página del producto.',
      section2Item3: 'Cobro duplicado o error operativo.',
      section2Item4: 'Fallo de activación tras soporte proporcionado.',
      section3Title: '3. Cuándo no hay reembolso',
      section3Item1: 'Producto ya activado o utilizado.',
      section3Item2: 'Cambio de opinión después de la entrega.',
      section3Item3: 'Incompatibilidad no reportada antes de la activación.',
      section4Title: '4. Cómo solicitar',
      section4Prefix: 'Ponte en contacto por e-mail ',
      section4Suffix: ' indicando el número del pedido, nombre del producto y motivo de la solicitud.',
      section5Title: '5. Plazo',
      section5Body: 'Responderemos tu solicitud en hasta 2 días hábiles. Si es aprobado, el plazo de procesamiento del reembolso depende del medio de pago.',
      section6Title: '6. Después de la activación',
      section6Body: 'Una vez activada la licencia, el reembolso solo está disponible en caso de fallo técnico comprobado que no pueda ser resuelto por nuestro equipo de soporte.'
    }
  }

  if (effectiveLang === 'fr') {
    return {
      title: 'Politique de remboursement',
      intro: 'Cette politique décrit les conditions de remboursement pour les produits numériques achetés sur ce site.',
      section1Title: '1. Produit numérique',
      section1Body: 'S\'agissant d\'un produit numérique, le remboursement peut dépendre du statut de livraison et de l\'utilisation du contenu.',
      section2Title: '2. Conditions de remboursement',
      section2Item1: 'Echec de livraison après support et tentative de résolution.',
      section2Item2: 'Incompatibilité prouvée avec les prérequis indiqués sur la page du produit.',
      section2Item3: 'Double facturation ou erreur opérationnelle.',
      section2Item4: 'Echec d\'activation après support fourni.',
      section3Title: '3. Quand le remboursement n\'est pas disponible',
      section3Item1: 'Produit déjà activé ou utilisé.',
      section3Item2: 'Changement d\'avis après livraison.',
      section3Item3: 'Incompatibilité non signalée avant l\'activation.',
      section4Title: '4. Comment faire une demande',
      section4Prefix: 'Contactez-nous par e-mail ',
      section4Suffix: ' en indiquant votre numéro de commande, le nom du produit et le motif de la demande.',
      section5Title: '5. Délai',
      section5Body: 'Nous répondrons dans un délai de 2 jours ouvrables. Si approuvé, le délai de traitement du remboursement dépend du moyen de paiement.',
      section6Title: '6. Après activation',
      section6Body: 'Une fois la licence activée, le remboursement n\'est disponible qu\'en cas de panne technique prouvée qui ne peut être résolue par notre équipe de support.'
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
    section2Item4: 'Falha de ativação após suporte fornecido.',
    section3Title: '3. Quando não há reembolso',
    section3Item1: 'Produto já ativado ou utilizado.',
    section3Item2: 'Mudança de ideia após a entrega.',
    section3Item3: 'Incompatibilidade não informada antes da ativação.',
    section4Title: '4. Como solicitar',
    section4Prefix: 'Entre em contato pelo e-mail ',
    section4Suffix: ' informando o número do pedido, nome do produto e motivo da solicitação.',
    section5Title: '5. Prazo de resposta',
    section5Body: 'Responderemos sua solicitação em até 2 dias úteis. Se aprovado, o prazo de processamento do reembolso depende do meio de pagamento.',
    section6Title: '6. Após ativação',
    section6Body: 'Uma vez ativada a licença, o reembolso só está disponível em caso de falha técnica comprovada que não possa ser resolvida pela nossa equipe de suporte.'
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
  return intl.language.value === 'en' ? '/refund-policy' : '/reembolso'
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}${canonicalPath.value}` }] : []
}))
</script>
