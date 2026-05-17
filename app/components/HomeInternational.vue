<template>
  <div class="min-h-screen bg-white">

    <!-- HERO -->
    <section class="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      </div>
      <div class="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div class="flex items-center gap-12">
          <div class="flex-1 max-w-2xl">
            <div class="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-blue-300 mb-6">
              <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Genuine Software Licenses — Instant Delivery
            </div>
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              {{ ui.heroTitle }}<br />
              <span class="text-blue-400">{{ ui.heroAccent }}</span>
            </h1>
            <p class="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl">
              {{ ui.heroDesc }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition"
              >
                {{ ui.heroCta }}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a
                href="#how-it-works"
                class="inline-flex items-center justify-center gap-2 border border-slate-500 hover:border-blue-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
              >
                {{ ui.howItWorks }}
              </a>
            </div>
          </div>
          <div v-if="heroImageUrl" class="hidden md:flex flex-shrink-0 w-96 items-center justify-center">
            <img
              :src="heroImageUrl"
              alt="Hero"
              class="w-full max-h-80 object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST BADGES -->
    <section class="bg-slate-50 border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="badge in trustBadges" :key="badge.title" class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
              {{ badge.icon }}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ badge.title }}</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ badge.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section id="products" class="max-w-7xl mx-auto px-6 py-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">{{ ui.featuredTitle }}</h2>
          <p class="text-slate-500 mt-1 text-sm">{{ ui.featuredDesc }}</p>
        </div>
        <NuxtLink to="/products" class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition hidden sm:block">
          {{ ui.viewAll }}
        </NuxtLink>
      </div>

      <!-- Skeleton -->
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        <div v-for="n in 8" :key="n" class="bg-slate-100 rounded-2xl h-[420px] animate-pulse" />
      </div>

      <!-- Cards -->
      <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        <div
          v-for="product in products.slice(0, 8)"
          :key="product.id"
          class="group flex flex-col bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer min-h-[420px]"
          @click="goToProduct(product)"
        >
          <!-- Image -->
          <div class="bg-slate-50 flex items-center justify-center h-56 shrink-0 overflow-hidden">
            <img
              :src="product.image || '/products/placeholder.svg'"
              :alt="product.name || product.nome"
              class="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <!-- Body -->
          <div class="flex flex-col flex-1 p-5">
            <h3 class="font-extrabold text-slate-900 text-base leading-snug line-clamp-3 mb-3 min-h-[3.5rem]">
              {{ product.name || product.nome }}
            </h3>

            <!-- Footer: price + button -->
            <div class="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
              <div class="flex items-baseline gap-2">
                <span v-if="product.usdPrice" class="text-3xl font-black text-blue-600 leading-none">
                  ${{ formatPrice(product.usdPrice) }}
                </span>
                <span
                  v-if="product.oldUsdPrice && product.oldUsdPrice > product.usdPrice"
                  class="text-sm text-slate-400 line-through"
                >
                  ${{ formatPrice(product.oldUsdPrice) }}
                </span>
                <span v-if="!product.usdPrice" class="text-sm text-slate-400 italic">{{ ui.comingSoon }}</span>
              </div>
              <button
                class="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl transition shadow-sm hover:shadow-md"
              >
                {{ ui.buyNow }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-slate-400">
        <div class="text-4xl mb-3">📦</div>
        <p>{{ ui.noProducts }}</p>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="bg-slate-50 py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">{{ ui.howItWorksTitle }}</h2>
          <p class="text-slate-500 mt-2">{{ ui.howItWorksDesc }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, i) in steps" :key="i" class="text-center">
            <div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-4 shadow-lg">
              {{ i + 1 }}
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-2">{{ step.title }}</h3>
            <p class="text-slate-500 text-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BENEFITS -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">{{ ui.whyUs }}</h2>
        <p class="text-slate-500 mt-2">{{ ui.whyUsDesc }}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="benefit in benefits"
          :key="benefit.title"
          class="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-sm transition"
        >
          <div class="text-3xl mb-3">{{ benefit.icon }}</div>
          <h3 class="font-bold text-slate-900 mb-2">{{ benefit.title }}</h3>
          <p class="text-sm text-slate-500">{{ benefit.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="bg-slate-50 py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">{{ ui.browseCategory }}</h2>
          <p class="text-slate-500 mt-2">{{ ui.browseCategoryDesc }}</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/products?category=${cat.slug}`"
            class="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 text-center hover:shadow-sm transition group"
          >
            <div class="text-3xl mb-2">{{ cat.icon }}</div>
            <div class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{{ cat.name }}</div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="max-w-4xl mx-auto px-6 py-16">
      <div class="text-center mb-10">
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900">{{ ui.faqTitle }}</h2>
      </div>
      <div class="space-y-3">
        <div
          v-for="(item, i) in faq"
          :key="i"
          class="border border-slate-200 rounded-2xl overflow-hidden"
        >
          <button
            class="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-900 hover:bg-slate-50 transition"
            @click="toggleFaq(i)"
          >
            {{ item.q }}
            <svg
              class="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform"
              :class="openFaq === i ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="openFaq === i" class="px-6 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
            {{ item.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BOTTOM -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">{{ ui.ctaTitle }}</h2>
        <p class="text-blue-100 text-lg mb-8">{{ ui.ctaDesc }}</p>
        <a
          href="#products"
          class="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-blue-50 transition"
        >
          {{ ui.ctaBtn }}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const intl = useIntlContext()
const lang = computed(() => intl.language.value)

const openFaq = ref<number | null>(null)
function toggleFaq(i: number) { openFaq.value = openFaq.value === i ? null : i }
function formatPrice(n: number) { return Number(n).toFixed(2) }

// ── UI strings ────────────────────────────────────────────────────────────────
const ui = computed(() => {
  const l = lang.value
  if (l === 'es') return {
    heroTitle: 'Licencias de Software Originales',
    heroAccent: 'al Mejor Precio',
    heroDesc: 'Windows, Office y más — licencias 100% originales entregadas al instante en tu correo. Pago seguro con Stripe.',
    heroCta: 'Ver Licencias',
    howItWorks: 'Cómo Funciona',
    featuredTitle: 'Licencias Destacadas',
    featuredDesc: 'Las más vendidas, listas para activación instantánea.',
    viewAll: 'Ver todas →',
    buyNow: 'Comprar ahora',
    comingSoon: 'Próximamente',
    noProducts: 'Productos próximamente.',
    howItWorksTitle: 'Cómo Funciona',
    howItWorksDesc: 'Tres simples pasos para activar tu licencia.',
    whyUs: 'Por Qué Elegirnos',
    whyUsDesc: 'Con la confianza de clientes en más de 50 países.',
    browseCategory: 'Explorar por Categoría',
    browseCategoryDesc: 'Encuentra la licencia que necesitas.',
    faqTitle: 'Preguntas Frecuentes',
    ctaTitle: '¿Listo para obtener tu licencia?',
    ctaDesc: 'Entrega instantánea. Pago seguro. Software original.',
    ctaBtn: 'Ver Licencias',
  }
  if (l === 'fr') return {
    heroTitle: 'Licences Logicielles Originales',
    heroAccent: 'au Meilleur Prix',
    heroDesc: 'Windows, Office et plus — licences 100% authentiques livrées instantanément par e-mail. Paiement sécurisé Stripe.',
    heroCta: 'Voir les licences',
    howItWorks: 'Comment ça marche',
    featuredTitle: 'Licences en vedette',
    featuredDesc: 'Les meilleures ventes, prêtes pour une activation instantanée.',
    viewAll: 'Tout voir →',
    buyNow: 'Acheter maintenant',
    comingSoon: 'Bientôt disponible',
    noProducts: 'Produits bientôt disponibles.',
    howItWorksTitle: 'Comment ça marche',
    howItWorksDesc: 'Trois étapes simples pour activer votre licence.',
    whyUs: 'Pourquoi Nous Choisir',
    whyUsDesc: 'Approuvé par des clients dans plus de 50 pays.',
    browseCategory: 'Parcourir par Catégorie',
    browseCategoryDesc: 'Trouvez la licence adaptée à vos besoins.',
    faqTitle: 'Questions Fréquentes',
    ctaTitle: 'Prêt à obtenir votre licence ?',
    ctaDesc: 'Livraison instantanée. Paiement sécurisé. Logiciel authentique.',
    ctaBtn: 'Parcourir les licences',
  }
  return {
    heroTitle: 'Original Software Licenses',
    heroAccent: 'at the Best Price',
    heroDesc: 'Windows, Office, and more — 100% genuine licenses delivered instantly to your email. Secure checkout with Stripe.',
    heroCta: 'View Licenses',
    howItWorks: 'How It Works',
    featuredTitle: 'Featured Licenses',
    featuredDesc: 'Best-selling software licenses, ready for instant activation.',
    viewAll: 'View all →',
    buyNow: 'Buy Now',
    comingSoon: 'Coming soon',
    noProducts: 'Products coming soon. Check back shortly.',
    howItWorksTitle: 'How It Works',
    howItWorksDesc: 'Three simple steps to activate your license.',
    whyUs: 'Why Choose Us',
    whyUsDesc: 'Trusted by customers in over 50 countries.',
    browseCategory: 'Browse by Category',
    browseCategoryDesc: 'Find the right license for your needs.',
    faqTitle: 'Frequently Asked Questions',
    ctaTitle: 'Ready to get your license?',
    ctaDesc: 'Instant delivery. Secure payment. Genuine software.',
    ctaBtn: 'Browse Licenses',
  }
})

const trustBadges = computed(() => {
  const l = lang.value
  if (l === 'es') return [
    { icon: '⚡', title: 'Entrega Instantánea', desc: 'Clave enviada a tu correo en minutos.' },
    { icon: '🔒', title: 'Pago Seguro', desc: 'Con Stripe — sin datos de tarjeta almacenados.' },
    { icon: '✅', title: 'Licencias Genuinas', desc: '100% originales, de fuentes oficiales.' },
    { icon: '🌍', title: 'Soporte Global', desc: 'Atención al cliente disponible en todo el mundo.' },
  ]
  if (l === 'fr') return [
    { icon: '⚡', title: 'Livraison Instantanée', desc: 'Clé envoyée à votre e-mail en quelques minutes.' },
    { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Propulsé par Stripe — aucune donnée stockée.' },
    { icon: '✅', title: 'Licences Authentiques', desc: '100% originales, issues de sources officielles.' },
    { icon: '🌍', title: 'Support Mondial', desc: 'Service client disponible dans le monde entier.' },
  ]
  return [
    { icon: '⚡', title: 'Instant Delivery', desc: 'License key sent to your email in minutes.' },
    { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Stripe — no card data stored.' },
    { icon: '✅', title: 'Genuine Licenses', desc: '100% original, direct from official sources.' },
    { icon: '🌍', title: 'Global Support', desc: 'Customer support available worldwide.' },
  ]
})

const steps = computed(() => {
  const l = lang.value
  if (l === 'es') return [
    { title: 'Elige tu Licencia', desc: 'Navega por el catálogo y selecciona el software que necesitas.' },
    { title: 'Paga con Stripe', desc: 'Completa el pago con tarjeta vía Stripe. USD y EUR aceptados.' },
    { title: 'Recibe tu Clave por Email', desc: 'Tu clave llega al instante a tu bandeja de entrada.' },
  ]
  if (l === 'fr') return [
    { title: 'Choisissez votre licence', desc: 'Parcourez notre catalogue et sélectionnez le logiciel dont vous avez besoin.' },
    { title: 'Payez via Stripe', desc: 'Finalisez le paiement par carte via Stripe. USD et EUR acceptés.' },
    { title: 'Recevez votre clé par e-mail', desc: 'Votre clé de licence est livrée instantanément dans votre boîte mail.' },
  ]
  return [
    { title: 'Choose Your License', desc: 'Browse our catalog and select the software you need.' },
    { title: 'Pay Securely with Stripe', desc: 'Complete checkout with credit/debit card via Stripe. USD and EUR accepted.' },
    { title: 'Receive Your Key by Email', desc: 'Your license key is delivered instantly to your inbox. Activate and enjoy.' },
  ]
})

const benefits = computed(() => {
  const l = lang.value
  if (l === 'es') return [
    { icon: '📧', title: 'Entrega por Email', desc: 'Tu clave llega directamente a tu correo, sin esperas.' },
    { icon: '💳', title: 'Pagos con Stripe', desc: 'Paga con cualquier tarjeta. USD y EUR soportados.' },
    { icon: '🛡️', title: '100% Genuinas', desc: 'Todas las licencias son auténticas con soporte oficial.' },
    { icon: '🔑', title: 'Activación Fácil', desc: 'Instrucciones paso a paso incluidas con cada clave.' },
    { icon: '🤝', title: 'Soporte al Cliente', desc: 'Nuestro equipo te ayuda con la activación.' },
    { icon: '🧾', title: 'Factura Disponible', desc: '¿Necesitas recibo? Se puede emitir factura previa solicitud.' },
  ]
  if (l === 'fr') return [
    { icon: '📧', title: 'Livraison par E-mail', desc: 'Votre clé arrive directement dans votre boîte mail.' },
    { icon: '💳', title: 'Paiements Stripe', desc: 'Payez avec n\'importe quelle carte. USD et EUR supportés.' },
    { icon: '🛡️', title: '100% Authentiques', desc: 'Toutes les licences sont authentiques avec support officiel.' },
    { icon: '🔑', title: 'Activation Facile', desc: 'Instructions étape par étape incluses avec chaque clé.' },
    { icon: '🤝', title: 'Support Client', desc: 'Notre équipe est prête à vous aider pour l\'activation.' },
    { icon: '🧾', title: 'Facture Disponible', desc: 'Besoin d\'un reçu ? Une facture peut être fournie sur demande.' },
  ]
  return [
    { icon: '📧', title: 'Email Delivery', desc: 'Your license key arrives directly in your inbox, no waiting, no shipping.' },
    { icon: '💳', title: 'Stripe Payments', desc: 'Pay safely with any major credit or debit card. USD and EUR supported.' },
    { icon: '🛡️', title: '100% Genuine', desc: 'All licenses are fully authentic and come with official activation support.' },
    { icon: '🔑', title: 'Easy Activation', desc: 'Simple step-by-step instructions included with every license key.' },
    { icon: '🤝', title: 'Customer Support', desc: 'Our team is ready to help you with activation and any questions.' },
    { icon: '🧾', title: 'Invoice Available', desc: 'Need a receipt? An invoice can be provided upon request.' },
  ]
})

const categories = computed(() => {
  const l = lang.value
  const names = l === 'es'
    ? { office: 'Microsoft Office', other: 'Otro Software', antivirus: 'Antivirus' }
    : l === 'fr'
    ? { office: 'Microsoft Office', other: 'Autre Logiciel', antivirus: 'Antivirus' }
    : { office: 'Microsoft Office', other: 'Other Software', antivirus: 'Antivirus' }
  return [
    { icon: '🪟', name: 'Windows', slug: 'windows' },
    { icon: '📊', name: names.office, slug: 'office' },
    { icon: '🛡️', name: names.antivirus, slug: 'antivirus' },
    { icon: '⚙️', name: names.other, slug: 'other' },
  ]
})

const faq = computed(() => {
  const l = lang.value
  if (l === 'es') return [
    { q: '¿Las licencias son genuinas?', a: 'Sí. Todas las licencias son 100% auténticas y de canales oficiales.' },
    { q: '¿Cuándo recibiré mi licencia?', a: 'Las claves se envían al correo en minutos tras la confirmación del pago.' },
    { q: '¿Qué monedas se aceptan?', a: 'Aceptamos USD y EUR vía Stripe.' },
    { q: '¿Puedo obtener factura?', a: 'Sí. Contacta al soporte tras tu compra.' },
    { q: '¿Y si la licencia no funciona?', a: 'Ofrecemos soporte completo. Si la clave es inválida, la reemplazamos o reembolsamos.' },
    { q: '¿Es seguro mi pago?', a: 'Sí. Stripe procesa el pago — nunca guardamos datos de tarjeta.' },
  ]
  if (l === 'fr') return [
    { q: 'Les licences sont-elles authentiques ?', a: 'Oui. Toutes nos licences sont 100% authentiques et proviennent de canaux officiels.' },
    { q: 'Quand vais-je recevoir ma licence ?', a: 'Les clés sont envoyées par e-mail en quelques minutes après la confirmation du paiement.' },
    { q: 'Quelles devises sont acceptées ?', a: 'Nous acceptons USD et EUR via Stripe.' },
    { q: 'Puis-je obtenir une facture ?', a: 'Oui. Contactez notre support après votre commande.' },
    { q: 'Et si la licence ne fonctionne pas ?', a: 'Nous offrons un support complet. Si une clé est invalide, nous la remplaçons ou remboursons.' },
    { q: 'Mon paiement est-il sécurisé ?', a: 'Absolument. Stripe traite le paiement — nous ne stockons jamais vos données de carte.' },
  ]
  return [
    { q: 'Are the licenses genuine?', a: 'Yes. All licenses we sell are 100% authentic and sourced from official channels.' },
    { q: 'How quickly will I receive my license?', a: 'License keys are delivered to your email within minutes of payment confirmation.' },
    { q: 'What currencies are accepted?', a: 'We accept USD and EUR via Stripe.' },
    { q: 'Can I get an invoice?', a: 'Yes. Contact our support team after completing your order.' },
    { q: 'What if the license doesn\'t work?', a: 'We offer full support. If a license key is invalid, we will replace it or issue a refund.' },
    { q: 'Is my payment information safe?', a: 'Absolutely. Payments are processed entirely by Stripe — we never store your card details.' },
  ]
})

interface IntlProduct {
  id: number
  name?: string
  nome?: string
  slug: string
  slugEn?: string | null
  image?: string | null
  usdPrice?: number | null
  eurPrice?: number | null
  oldUsdPrice?: number | null
}

function goToProduct(product: IntlProduct) {
  const slugToUse = product.slugEn || product.slug
  navigateTo(`/product/${slugToUse}`)
}

const { data: homeTheme } = await useFetch<any>('/api/home-theme', {
  server: true,
  default: () => null
})

const heroImageUrl = computed(() => {
  const url = String(homeTheme.value?.theme?.hero?.imageUrl || '').trim()
  return url || null
})

const { data: rawProducts, pending } = await useFetch<any>('/api/intl/products', {
  server: false,
  lazy: true,
  default: () => ({ ok: true, produtos: [] })
})

const products = computed<IntlProduct[]>(() => {
  const raw = rawProducts.value
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.produtos) ? raw.produtos : []
  return list
    .filter((p: any) => p.usdPrice != null && Number(p.usdPrice) > 0)
    .map((p: any) => ({
      id: p.id,
      name: p.name || p.nome,
      slug: p.slug,
      slugEn: p.slugEn,
      image: p.image || p.imagem,
      usdPrice: Number(p.usdPrice),
      oldUsdPrice: p.oldUsdPrice ? Number(p.oldUsdPrice) : null,
      eurPrice: p.eurPrice ? Number(p.eurPrice) : null,
    }))
})
</script>
