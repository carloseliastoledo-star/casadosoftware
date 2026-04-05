<script setup lang="ts">
export interface SeoPageData {
  id: string
  locale: string
  slug: string
  title: string
  seoTitle?: string | null
  seoDescription?: string | null
  h1?: string | null
  heroBadge?: string | null
  heroDescription?: string | null
  contentHtml?: string | null
  faqJson?: string | null
  linkedProductSlug?: string | null
  linkedCategorySlug?: string | null
  templateKey: string
  status: string
  noindex: boolean
  publishedAt?: string | null
}

const props = defineProps<{ page: SeoPageData }>()

const faqs = computed<Array<{ q: string; a: string }>>(() => {
  if (!props.page.faqJson) return []
  try { return JSON.parse(props.page.faqJson) } catch { return [] }
})

const productLink = computed(() => {
  if (!props.page.linkedProductSlug) return null
  return props.page.locale === 'en'
    ? `/product/${props.page.linkedProductSlug}`
    : `/produto/${props.page.linkedProductSlug}`
})

const ctaLabel = computed(() =>
  props.page.locale === 'en' ? 'Buy Now — Best Price' : 'Comprar Agora — Melhor Preço'
)

const trustBadges = computed(() =>
  props.page.locale === 'en'
    ? ['✅ Original License', '⚡ Instant Delivery', '🔒 Secure Payment', '🌟 5-Star Support']
    : ['✅ Licença Original', '⚡ Entrega Imediata', '🔒 Pagamento Seguro', '🌟 Suporte 5 Estrelas']
)

const benefitItems = computed(() =>
  props.page.locale === 'en'
    ? [
        { icon: '🏷️', title: 'Cheapest Price', desc: 'Genuine license at the best market price.' },
        { icon: '📦', title: 'Instant Delivery', desc: 'Receive your key by email in minutes.' },
        { icon: '🛡️', title: 'Lifetime Valid', desc: 'Permanent activation, no subscriptions.' },
        { icon: '💬', title: '24/7 Support', desc: 'We help you activate step by step.' }
      ]
    : [
        { icon: '🏷️', title: 'Menor Preço', desc: 'Licença genuína pelo melhor preço do mercado.' },
        { icon: '📦', title: 'Entrega Imediata', desc: 'Receba sua chave por e-mail em minutos.' },
        { icon: '🛡️', title: 'Válida Vitalícia', desc: 'Ativação permanente, sem mensalidades.' },
        { icon: '💬', title: 'Suporte 24/7', desc: 'Ajudamos a ativar passo a passo.' }
      ]
)

const openIndex = ref<number | null>(null)
function toggleFaq(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- HERO -->
    <section class="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white pt-16 pb-20 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <span
          v-if="page.heroBadge"
          class="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wide"
        >
          {{ page.heroBadge }}
        </span>

        <h1 class="text-3xl md:text-5xl font-extrabold leading-tight mb-5">
          {{ page.h1 || page.title }}
        </h1>

        <p
          v-if="page.heroDescription"
          class="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto"
        >
          {{ page.heroDescription }}
        </p>

        <a
          v-if="productLink"
          :href="productLink"
          class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg transition-transform hover:scale-105"
        >
          {{ ctaLabel }}
        </a>

        <!-- Trust badges -->
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <span
            v-for="badge in trustBadges"
            :key="badge"
            class="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full border border-white/20"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </section>

    <!-- BENEFITS -->
    <section class="py-14 px-4 bg-gray-50">
      <div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          v-for="b in benefitItems"
          :key="b.title"
          class="flex items-start gap-4 bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
        >
          <div class="text-3xl">{{ b.icon }}</div>
          <div>
            <div class="font-bold text-gray-900 mb-1">{{ b.title }}</div>
            <div class="text-gray-500 text-sm">{{ b.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENT HTML -->
    <section
      v-if="page.contentHtml"
      class="py-14 px-4"
    >
      <div
        class="max-w-3xl mx-auto prose prose-blue prose-lg"
        v-html="page.contentHtml"
      />
    </section>

    <!-- FAQ -->
    <section v-if="faqs.length" class="py-14 px-4 bg-gray-50">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          {{ page.locale === 'en' ? 'Frequently Asked Questions' : 'Perguntas Frequentes' }}
        </h2>

        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition"
              @click="toggleFaq(i)"
            >
              <span>{{ faq.q }}</span>
              <span class="text-blue-600 text-xl ml-3 flex-shrink-0">
                {{ openIndex === i ? '−' : '+' }}
              </span>
            </button>
            <div
              v-show="openIndex === i"
              class="px-5 pb-5 text-gray-600 text-sm leading-relaxed"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section v-if="productLink" class="py-14 px-4 bg-blue-700 text-white text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-extrabold mb-4">
          {{ page.locale === 'en' ? 'Ready to get your license?' : 'Pronto para obter sua licença?' }}
        </h2>
        <p class="text-blue-100 mb-8 text-lg">
          {{ page.locale === 'en'
            ? 'Instant activation. Lifetime valid. Best price guaranteed.'
            : 'Ativação imediata. Validade vitalícia. Menor preço garantido.' }}
        </p>
        <a
          :href="productLink"
          class="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg transition-transform hover:scale-105"
        >
          {{ ctaLabel }}
        </a>
      </div>
    </section>

  </div>
</template>
