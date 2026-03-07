<template>
  <div class="bg-white">
    <main>
      <section class="py-20">
        <div class="container mx-auto max-w-6xl px-4">
          <div class="mx-auto max-w-3xl text-center">
            <h1 class="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{{ t.title }}</h1>
            <p class="mt-6 text-lg leading-7 text-gray-600">
              {{ t.subtitle }}
            </p>
          </div>

          <div class="mx-auto mt-12 max-w-2xl">
            <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
              <div v-if="submitted" class="text-center">
                <h2 class="text-2xl font-semibold tracking-tight text-gray-900">{{ t.successTitle }}</h2>
                <p class="mt-3 text-sm leading-6 text-gray-600">{{ t.successBody }}</p>
                <div class="mt-8">
                  <NuxtLink
                    to="/"
                    class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    {{ t.successCta }}
                  </NuxtLink>
                </div>
              </div>

              <form v-else class="space-y-6" @submit.prevent="onSubmit">
                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-900">{{ t.nameLabel }}</label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      autocomplete="name"
                      maxlength="120"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>

                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-900">{{ t.emailLabel }}</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      maxlength="255"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>
                </div>

                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-900">{{ t.websiteLabel }}</label>
                    <input
                      id="website"
                      v-model="form.website"
                      type="url"
                      inputmode="url"
                      maxlength="255"
                      placeholder="https://"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>

                  <div>
                    <label for="social" class="block text-sm font-medium text-gray-900">{{ t.socialLabel }}</label>
                    <input
                      id="social"
                      v-model="form.social"
                      type="text"
                      maxlength="255"
                      :placeholder="t.socialPlaceholder"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>
                </div>

                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-900">{{ t.countryLabel }}</label>
                    <input
                      id="country"
                      v-model="form.country"
                      type="text"
                      autocomplete="country-name"
                      maxlength="80"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>

                  <div>
                    <label for="monthlyTraffic" class="block text-sm font-medium text-gray-900">{{ t.trafficLabel }}</label>
                    <input
                      id="monthlyTraffic"
                      v-model="form.monthlyTraffic"
                      type="text"
                      maxlength="120"
                      :placeholder="t.trafficPlaceholder"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>
                </div>

                <div>
                  <label for="promotionPlan" class="block text-sm font-medium text-gray-900">{{ t.planLabel }}</label>
                  <textarea
                    id="promotionPlan"
                    v-model="form.promotionPlan"
                    rows="6"
                    maxlength="2000"
                    :placeholder="t.planPlaceholder"
                    class="mt-2 block w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div class="flex items-center justify-between gap-4">
                  <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
                  <div class="ml-auto">
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="submitting"
                    >
                      <span v-if="submitting">{{ t.submitting }}</span>
                      <span v-else>{{ t.submit }}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p class="mt-6 text-center text-sm text-gray-500">
              {{ t.disclaimer }}
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useIntlContext } from '#imports'

const intl = useIntlContext()

const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  website: '',
  social: '',
  country: '',
  monthlyTraffic: '',
  promotionPlan: '',
})

const t = computed(() => {
  const lang = intl.language.value

  if (lang === 'en') {
    return {
      title: 'Partner Program',
      subtitle: 'Apply to join our partner program. We’ll review your details and get back to you by email.',
      successTitle: 'Application received',
      successBody: 'Thanks! We’ll contact you soon.',
      successCta: 'Back to home',
      nameLabel: 'Name',
      emailLabel: 'Email',
      websiteLabel: 'Website',
      socialLabel: 'YouTube / Social',
      socialPlaceholder: 'Channel / profile URL',
      countryLabel: 'Country',
      trafficLabel: 'Monthly traffic',
      trafficPlaceholder: 'e.g. 50k visits / month',
      planLabel: 'How will you promote?',
      planPlaceholder: 'Tell us about your strategy, channels, and audience...',
      submitting: 'Submitting...',
      submit: 'Submit application',
      disclaimer: 'By submitting, you agree to be contacted about the partner program.',
      seoTitle: 'Partner Program | Casa do Software',
      seoDescription: 'Apply to join the Casa do Software partner program.'
    }
  }

  if (lang === 'es') {
    return {
      title: 'Programa de Afiliados',
      subtitle: 'Solicita participar en nuestro programa. Revisaremos tus datos y te contactaremos por e-mail.',
      successTitle: 'Solicitud recibida',
      successBody: '¡Gracias! Nos pondremos en contacto pronto.',
      successCta: 'Volver al inicio',
      nameLabel: 'Nombre',
      emailLabel: 'Email',
      websiteLabel: 'Sitio web',
      socialLabel: 'YouTube / Redes',
      socialPlaceholder: 'Canal / URL del perfil',
      countryLabel: 'País',
      trafficLabel: 'Tráfico mensual',
      trafficPlaceholder: 'ej: 50k visitas / mes',
      planLabel: '¿Cómo vas a promocionar?',
      planPlaceholder: 'Cuéntanos tu estrategia, canales y audiencia...',
      submitting: 'Enviando...',
      submit: 'Enviar solicitud',
      disclaimer: 'Al enviar, aceptas que te contactemos sobre el programa.',
      seoTitle: 'Programa de Afiliados | Casa do Software',
      seoDescription: 'Solicita participar en el programa de afiliados de Casa do Software.'
    }
  }

  if (lang === 'it') {
    return {
      title: 'Programma di Affiliazione',
      subtitle: 'Richiedi di partecipare al nostro programma. Valuteremo i tuoi dati e ti contatteremo via email.',
      successTitle: 'Richiesta ricevuta',
      successBody: 'Grazie! Ti contatteremo a breve.',
      successCta: 'Torna alla home',
      nameLabel: 'Nome',
      emailLabel: 'Email',
      websiteLabel: 'Sito web',
      socialLabel: 'YouTube / Social',
      socialPlaceholder: 'Canale / URL profilo',
      countryLabel: 'Paese',
      trafficLabel: 'Traffico mensile',
      trafficPlaceholder: 'es: 50k visite / mese',
      planLabel: 'Come promuoverai?',
      planPlaceholder: 'Raccontaci strategia, canali e pubblico...',
      submitting: 'Invio...',
      submit: 'Invia richiesta',
      disclaimer: 'Inviando, accetti di essere contattato riguardo al programma.',
      seoTitle: 'Programma di Affiliazione | Casa do Software',
      seoDescription: 'Richiedi di partecipare al programma di affiliazione di Casa do Software.'
    }
  }

  if (lang === 'fr') {
    return {
      title: 'Programme d’affiliation',
      subtitle: 'Demandez à rejoindre notre programme. Nous analyserons vos informations et vous contacterons par e-mail.',
      successTitle: 'Demande reçue',
      successBody: 'Merci ! Nous vous contacterons bientôt.',
      successCta: 'Retour à l’accueil',
      nameLabel: 'Nom',
      emailLabel: 'Email',
      websiteLabel: 'Site web',
      socialLabel: 'YouTube / Réseaux',
      socialPlaceholder: 'Chaîne / URL du profil',
      countryLabel: 'Pays',
      trafficLabel: 'Trafic mensuel',
      trafficPlaceholder: 'ex : 50k visites / mois',
      planLabel: 'Comment allez-vous promouvoir ?',
      planPlaceholder: 'Parlez-nous de votre stratégie, canaux et audience...',
      submitting: 'Envoi...',
      submit: 'Envoyer la demande',
      disclaimer: 'En envoyant, vous acceptez d’être contacté au sujet du programme.',
      seoTitle: 'Programme d’affiliation | Casa do Software',
      seoDescription: 'Demandez à rejoindre le programme d’affiliation de Casa do Software.'
    }
  }

  return {
    title: 'Programa de Afiliados',
    subtitle: 'Solicite sua participação no programa. Vamos analisar seus dados e entrar em contato por e-mail.',
    successTitle: 'Solicitação recebida',
    successBody: 'Obrigado! Em breve entraremos em contato.',
    successCta: 'Voltar para a home',
    nameLabel: 'Nome',
    emailLabel: 'E-mail',
    websiteLabel: 'Site (opcional)',
    socialLabel: 'YouTube / Social (opcional)',
    socialPlaceholder: 'Canal / URL do perfil',
    countryLabel: 'País',
    trafficLabel: 'Tráfego mensal (opcional)',
    trafficPlaceholder: 'ex: 50k visitas / mês',
    planLabel: 'Como você pretende divulgar? (opcional)',
    planPlaceholder: 'Conte sua estratégia, canais e audiência...',
    submitting: 'Enviando...',
    submit: 'Enviar inscrição',
    disclaimer: 'Ao enviar, você concorda em ser contatado sobre o programa.',
    seoTitle: 'Programa de Afiliados | Casa do Software',
    seoDescription: 'Solicite participação no programa de afiliados da Casa do Software.'
  }
})

useHead(() => ({
  title: t.value.seoTitle,
  meta: [
    {
      name: 'description',
      content: t.value.seoDescription
    }
  ]
}))

async function onSubmit() {
  error.value = ''
  submitting.value = true

  try {
    await $fetch('/api/partner-apply', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        website: form.website,
        social: form.social,
        country: form.country,
        monthlyTraffic: form.monthlyTraffic,
        promotionPlan: form.promotionPlan,
      },
    })

    submitted.value = true
  } catch (e: any) {
    error.value = String(
      e?.data?.statusMessage ||
        e?.statusMessage ||
        e?.message ||
        (intl.language.value === 'pt'
          ? 'Não foi possível enviar. Tente novamente.'
          : intl.language.value === 'es'
            ? 'No se pudo enviar. Inténtalo de nuevo.'
            : intl.language.value === 'it'
              ? 'Impossibile inviare. Riprova.'
              : intl.language.value === 'fr'
                ? "Impossible d'envoyer. Réessayez."
                : 'Could not submit. Please try again.')
    )
  } finally {
    submitting.value = false
  }
}
</script>
