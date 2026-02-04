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
        <h2 class="text-xl font-bold text-gray-900">{{ t.howReceiveTitle }}</h2>
        <ul class="text-sm list-disc pl-5 space-y-2">
          <li>{{ t.howReceiveItem1 }}</li>
          <li>{{ t.howReceiveItem2 }}</li>
          <li>{{ t.howReceiveItem3 }}</li>
        </ul>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.deadlineTitle }}</h2>
        <p class="text-sm">
          {{ t.deadlineBody }}
        </p>
      </div>

      <div class="rounded-xl border bg-white p-5 space-y-3">
        <h2 class="text-xl font-bold text-gray-900">{{ t.supportTitle }}</h2>
        <p class="text-sm">
          {{ t.supportPrefix }}
          <a class="text-blue-600 hover:underline" :href="mailtoSupport">{{ supportEmail }}</a>.
        </p>
      </div>

      <p class="text-sm text-gray-600">
        Eletrokeys LTDA — CNPJ 44.694.365/0001-48.
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
      title: 'Digital delivery',
      intro: 'Our products are digital. Delivery method and instructions are available on each product page.',
      howReceiveTitle: 'How you receive it',
      howReceiveItem1: 'Delivery by email to the address used in the purchase and/or availability in the customer area.',
      howReceiveItem2: 'Delivery happens after payment confirmation.',
      howReceiveItem3: 'Content and instructions vary according to the purchased product.',
      m365Title: 'Microsoft 365 (annual subscription)',
      m365Intro:
        'When the product is a Microsoft 365/Office 365 subscription, delivery is made through a provided account (login and password) valid for the stated period (12 months).',
      m365Item1: 'You receive the access credentials (login and password) by email after payment confirmation.',
      m365Item2: 'Access is made with the provided account (it is not activation on an existing personal Microsoft account).',
      m365Item3: 'Access/installation instructions are included with the delivery.',
      deadlineTitle: 'Delivery time',
      deadlineBody:
        'The estimated delivery time is informed at checkout and on the product page. If you have any questions, our support team can help quickly.',
      supportTitle: 'Support',
      supportPrefix: 'If you do not receive the delivery within the informed time, contact us by email '
    }
  }

  if (intl.language.value === 'es') {
    return {
      title: 'Entrega digital',
      intro: 'Nuestros productos son digitales. El método de entrega y las instrucciones se indican en la página de cada producto.',
      howReceiveTitle: 'Cómo lo recibes',
      howReceiveItem1: 'Envío por correo al e-mail informado en la compra y/o disponibilidad en el área del cliente.',
      howReceiveItem2: 'El envío ocurre después de la confirmación del pago.',
      howReceiveItem3: 'El contenido y las instrucciones varían según el producto adquirido.',
      m365Title: 'Microsoft 365 (suscripción anual)',
      m365Intro:
        'Cuando el producto es una suscripción de Microsoft 365/Office 365, la entrega se realiza mediante una cuenta proporcionada (usuario y contraseña) válida por el periodo informado (12 meses).',
      m365Item1: 'Recibes los datos de acceso (usuario y contraseña) por e-mail después de la confirmación del pago.',
      m365Item2: 'El acceso se realiza con la cuenta proporcionada (no es activación en una cuenta Microsoft personal existente).',
      m365Item3: 'Las instrucciones de acceso/instalación acompañan la entrega.',
      deadlineTitle: 'Plazo',
      deadlineBody:
        'El plazo estimado de entrega se informa al momento de la compra y en la página del producto. Si tienes dudas, nuestro soporte ayuda rápidamente.',
      supportTitle: 'Soporte',
      supportPrefix: 'Si no recibes la entrega dentro del plazo informado, contáctanos por e-mail '
    }
  }

  return {
    title: 'Entrega Digital',
    intro: 'Nossos produtos são digitais. A forma de entrega e as instruções constam na página de cada produto.',
    howReceiveTitle: 'Como você recebe',
    howReceiveItem1: 'Envio por e-mail para o endereço cadastrado na compra e/ou disponibilização na área do cliente.',
    howReceiveItem2: 'O envio acontece após a confirmação do pagamento.',
    howReceiveItem3: 'Conteúdo e instruções variam conforme o produto adquirido.',
    m365Title: 'Microsoft 365 (assinatura anual)',
    m365Intro:
      'Quando o produto é uma assinatura do Microsoft 365/Office 365, a entrega é feita por meio de uma conta fornecida (login e senha) válida pelo período informado (12 meses).',
    m365Item1: 'Você recebe os dados de acesso (login e senha) por e-mail após a confirmação do pagamento.',
    m365Item2: 'O acesso é feito com a conta fornecida (não é ativação em uma conta Microsoft pessoal já existente).',
    m365Item3: 'As instruções de acesso/instalação acompanham a entrega.',
    deadlineTitle: 'Prazo',
    deadlineBody:
      'O prazo estimado de entrega é informado no momento da compra e na página do produto. Em caso de dúvidas, nosso suporte auxilia rapidamente.',
    supportTitle: 'Suporte',
    supportPrefix: 'Se você não receber a entrega dentro do prazo, entre em contato pelo e-mail '
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
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/entrega-digital` }] : []
}))
</script>
