<template>
  <div class="min-h-screen flex flex-col bg-white">

    <div v-if="topbarText" class="bg-blue-600 text-white text-xs">
      <div class="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center font-semibold">
        <a
          v-if="topbarLink"
          :href="topbarLink"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline"
        >
          {{ topbarText }}
        </a>
        <span v-else>{{ topbarText }}</span>
      </div>
    </div>

    <!-- HEADER -->
    <header v-if="!isLicencasDigitais" class="border-b bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6">
        <div class="h-16 md:h-20 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <button
              type="button"
              class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border text-gray-700"
              @click="mobileMenuOpen = true"
              :aria-label="t.openMenu"
            >
              ☰
            </button>

            <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
              <picture>
                <source v-if="effectiveLogoWebpPath" :srcset="effectiveLogoWebpPath" type="image/webp" />
                <img :src="effectiveLogoPath" :alt="siteName" class="h-12 md:h-14 w-auto" />
              </picture>
              <span class="hidden sm:block text-base md:text-lg font-extrabold tracking-tight text-gray-900 truncate">
                {{ siteName }}
              </span>
            </NuxtLink>
          </div>

          <form class="hidden md:flex flex-1 max-w-2xl" @submit.prevent="submitSearch">
            <div class="flex w-full">
              <input
                v-model="search"
                type="search"
                :placeholder="t.searchPlaceholder"
                class="w-full h-11 rounded-l-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
              <button
                type="submit"
                class="h-11 px-5 rounded-r-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm"
              >
                {{ t.searchButton }}
              </button>
            </div>
          </form>

          <div class="flex items-center gap-3">
            <NuxtLink
              to="/minha-conta/login"
              class="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
            >
              <span aria-hidden="true">👤</span>
              <span>{{ t.myAccount }}</span>
            </NuxtLink>

            <NuxtLink
              to="/checkout"
              class="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
            >
              <span aria-hidden="true">🛒</span>
              <span class="font-semibold">{{ t.cart }}</span>
              <span
                v-if="cartCount > 0"
                class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center"
              >
                {{ cartCount }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-6 h-12 border-t">
          <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600">
            <span aria-hidden="true">🏠</span>
            {{ t.home }}
          </NuxtLink>
          <NuxtLink
            v-for="it in mainMenu"
            :key="it.label"
            :to="it.to"
            class="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
          >
            <span aria-hidden="true">{{ menuIcon(it.label) }}</span>
            {{ it.label }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <header v-else class="bg-white border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6">
        <div class="h-20 flex items-center justify-between gap-6">
          <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
            <picture>
              <source v-if="effectiveLogoWebpPath" :srcset="effectiveLogoWebpPath" type="image/webp" />
              <img :src="effectiveLogoPath" :alt="siteName" class="h-10 md:h-12 w-auto" />
            </picture>
          </NuxtLink>

          <nav class="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-800">
            <NuxtLink to="/categoria/windows" class="hover:text-blue-600">Windows</NuxtLink>
            <NuxtLink to="/categoria/windows-server" class="hover:text-blue-600">Windows Server</NuxtLink>
            <NuxtLink to="/categoria/office" class="hover:text-blue-600">Office</NuxtLink>
            <NuxtLink to="/categoria/corel" class="hover:text-blue-600">Corel</NuxtLink>
            <NuxtLink to="/categoria/autodesk" class="hover:text-blue-600">Autodesk</NuxtLink>
            <NuxtLink to="/blog" class="hover:text-blue-600">Blog</NuxtLink>
          </nav>

          <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-2">
              <select
                class="h-10 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-800"
                :value="intl.countryCode || 'AUTO'"
                aria-label="Country"
                @change="onCountryChange"
              >
                <option value="AUTO">AUTO</option>
                <option value="BR">BR</option>
                <option value="US">US</option>
                <option value="GB">UK</option>
                <option value="ES">ES</option>
                <option value="PT">PT</option>
                <option value="DE">DE</option>
                <option value="FR">FR</option>
              </select>

              <select
                class="h-10 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-800"
                :value="intl.language"
                aria-label="Language"
                @change="onLangChange"
              >
                <option value="pt">PT</option>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>

              <select
                class="h-10 rounded-md border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-800"
                :value="intl.currencyLower"
                aria-label="Currency"
                @change="onCurrencyChange"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="brl">BRL</option>
              </select>
            </div>

            <form class="hidden md:flex w-[360px]" @submit.prevent="submitSearch">
              <input
                v-model="search"
                type="search"
                :placeholder="t.searchPlaceholder"
                class="w-full h-10 rounded-l-md border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
              <button type="submit" class="h-10 px-4 rounded-r-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm">
                {{ t.searchButton }}
              </button>
            </form>

            <NuxtLink to="/checkout" class="relative inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 hover:bg-gray-50">
              <span aria-hidden="true">🛒</span>
              <span
                v-if="cartCount > 0"
                class="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center"
              >
                {{ cartCount }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 md:hidden">
      <div class="absolute inset-0 bg-black/40" @click="mobileMenuOpen = false" />
      <div class="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-3">
            <picture>
              <source v-if="effectiveLogoWebpPath" :srcset="effectiveLogoWebpPath" type="image/webp" />
              <img :src="effectiveLogoPath" :alt="siteName" class="h-12 w-auto" />
            </picture>
            <div class="font-extrabold text-gray-900">{{ siteName }}</div>
          </div>
          <button
            type="button"
            class="text-gray-600"
            @click="mobileMenuOpen = false"
            :aria-label="t.closeMenu"
          >
            ✕
          </button>
        </div>

        <nav class="p-5 flex-1 overflow-y-auto">
          <div class="space-y-1">
            <NuxtLink
              v-for="it in mainMenu"
              :key="it.label"
              :to="it.to"
              class="block px-3 py-3 rounded-lg text-gray-800 font-semibold hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              {{ it.label }}
            </NuxtLink>

            <NuxtLink
              to="/minha-conta/login"
              class="block px-3 py-3 rounded-lg text-gray-800 font-semibold hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              {{ t.myAccount }}
            </NuxtLink>
          </div>
        </nav>

        <div class="p-5 border-t">
          <NuxtLink
            to="/checkout"
            class="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-xl transition"
            @click="mobileMenuOpen = false"
          >
            {{ t.goToCart }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- CONTEÚDO DAS PÁGINAS -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- FOOTER -->
    <footer v-if="isLicencasDigitais" class="bg-[#f2f4f3] text-gray-700 mt-20">
      <div class="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-5 gap-12 text-sm">
        <div class="md:col-span-1">
          <img src="/licencasdigitais-gvg/logo-footer.svg" :alt="siteName" class="h-9 w-auto" loading="lazy" decoding="async" />
          <div class="mt-6 flex items-center gap-4 text-gray-500">
            <a href="#" aria-label="Facebook" class="hover:text-gray-700">f</a>
            <a href="#" aria-label="Instagram" class="hover:text-gray-700">◎</a>
          </div>
          <div class="mt-6 text-xs text-gray-400">© {{ new Date().getFullYear() }} H12 Themes</div>
        </div>

        <div>
          <div class="font-extrabold tracking-widest text-xs text-sky-600">CALL CENTER AND POLICY</div>
          <div class="mt-4 space-y-2 text-gray-600">
            <div>
              <span class="font-semibold text-gray-700">Email:</span>
              <span class="ml-1">service@gvgmall.com</span>
            </div>
            <NuxtLink to="/reembolso" class="block hover:underline">Policys of Refunds and Exchange</NuxtLink>
            <NuxtLink to="/privacidade" class="block hover:underline">Privacy Policy</NuxtLink>
            <NuxtLink to="/termos" class="block hover:underline">Terms of Service</NuxtLink>
            <NuxtLink to="/privacidade" class="block hover:underline">Privacy and Safety</NuxtLink>
            <NuxtLink to="/quem-somos" class="block hover:underline">Legal Notice</NuxtLink>
          </div>
        </div>

        <div>
          <div class="font-extrabold tracking-widest text-xs text-sky-600">WORKING HOURS</div>
          <div class="mt-4 space-y-2 text-gray-600">
            <div>Monday-Friday: 08AM - 10PM</div>
            <div>Saturday: 10AM - 05PM</div>
            <div>Sunday: 10AM - 05PM</div>
          </div>
        </div>

        <div>
          <div class="font-extrabold tracking-widest text-xs text-sky-600">OUR ADRESS</div>
          <div class="mt-4 space-y-2 text-gray-600">
            <div>2880 W Oakland Park Blvd.</div>
            <div>Florida - USA</div>
            <div>20037, United States</div>
          </div>
        </div>

        <div>
          <div class="font-extrabold tracking-widest text-xs text-sky-600">WE ACCEPT</div>
          <div class="mt-4 grid grid-cols-4 gap-3">
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
            <div class="h-6 rounded bg-white border" />
          </div>
        </div>
      </div>
    </footer>

    <footer v-else class="bg-gray-100 border-t mt-20">
      <div class="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">{{ siteName }}</h3>
          <p>
            {{ footerDescriptionText }}
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">{{ footerLinksTitleText }}</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/produtos" class="hover:text-blue-600">{{ t.footerProducts }}</NuxtLink></li>
            <li><NuxtLink to="/tutoriais" class="hover:text-blue-600">{{ t.footerTutorials }}</NuxtLink></li>
            <li><NuxtLink to="/blog" class="hover:text-blue-600">{{ t.footerBlog }}</NuxtLink></li>
            <li><NuxtLink to="/quem-somos" class="hover:text-blue-600">{{ t.footerAbout }}</NuxtLink></li>
            <li><NuxtLink to="/entrega-digital" class="hover:text-blue-600">{{ t.footerDigitalDelivery }}</NuxtLink></li>
            <li><NuxtLink to="/reembolso" class="hover:text-blue-600">{{ t.footerRefundPolicy }}</NuxtLink></li>
            <li><NuxtLink to="/privacidade" class="hover:text-blue-600">{{ t.footerPrivacy }}</NuxtLink></li>
            <li><NuxtLink to="/termos" class="hover:text-blue-600">{{ t.footerTerms }}</NuxtLink></li>
            <li v-for="p in paginas" :key="p.slug">
              <NuxtLink :to="`/paginas/${p.slug}`" class="hover:text-blue-600">{{ p.titulo }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-gray-800 mb-2">{{ t.footerSupportTitle }}</h3>
          <p>{{ t.footerSupportSubtitle }}</p>
          <p class="mt-2">{{ t.footerIntlSupport }}</p>
          <p v-if="supportEmail" class="mt-2 font-medium text-gray-800">
            {{ supportEmail }}
          </p>
          <p v-if="whatsappHref" class="mt-2 font-medium text-gray-800">
            <a class="hover:underline" :href="whatsappHref" target="_blank" rel="noopener noreferrer">
              {{ t.whatsappPrefix }} {{ whatsappLabel }}
            </a>
          </p>
          <div class="mt-4 text-xs text-gray-500 space-y-1">
            <p><span class="font-semibold">Razão Social:</span> {{ companyLegalName }}</p>
            <p><span class="font-semibold">CNPJ:</span> {{ companyCnpj }}</p>
            <p>
              <span class="font-semibold">Endereço:</span> {{ companyAddress }}
            </p>
            <p><span class="font-semibold">Telefone/Whatsapp:</span> {{ companyPhone }}</p>
            <p><span class="font-semibold">E-mail:</span> {{ companyEmail }}</p>
          </div>
        </div>
      </div>

      <div class="text-center text-xs text-gray-500 py-4 border-t">
        © {{ new Date().getFullYear() }} {{ siteName }} — {{ t.rightsReserved }}
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
const {
  siteName,
  logoPath,
  supportEmail,
  topbarText,
  topbarLink,
  whatsappNumber,
  companyLegalName,
  companyCnpj,
  companyAddress,
  companyPhone,
  companyEmail
} = useSiteBranding()

const config = useRuntimeConfig()

const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const normalizedHost = computed(() => {
  if (import.meta.server) {
    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
  }

  return String(window.location.host || '').toLowerCase()
})

const isLicencasDigitais = computed(() => {
  if (normalizedHost.value.includes('licencasdigitais.com.br')) return true
  return storeSlug.value === 'licencasdigitais'
})

const logoWebpPath = computed(() => {
  const raw = String(logoPath || '').trim()
  if (!raw) return ''
  if (raw.endsWith('.webp')) return raw
  return ''
})

const effectiveLogoPath = computed(() => {
  if (isLicencasDigitais.value) return '/licencasdigitais-gvg/logo.png'
  return String(logoPath || '').trim() || '/logo-mercadosoftwares.png'
})

const effectiveLogoWebpPath = computed(() => {
  const raw = String(effectiveLogoPath.value || '').trim()
  if (!raw) return ''
  if (raw.endsWith('.webp')) return raw
  return ''
})

const safeSiteName = computed(() => {
  const n = String(siteName || '').trim()
  return n || 'Licenças Digitais'
})

const intl = useIntlContext()

const route = useRoute()

const mobileMenuOpen = ref(false)

const search = ref('')

watch(
  () => route.query.q,
  (q) => {
    const next = String(q || '').trim()
    if (next && next !== search.value) search.value = next
  },
  { immediate: true }
)

const mainMenuBase = [
  { label: 'Windows', slug: 'windows', fallbackTo: '/categorias' },
  { label: 'Office', slug: 'office', fallbackTo: '/categorias' },
  { label: 'Windows Server', slug: 'windows-server', fallbackTo: '/categorias' },
  { label: 'Autodesk', slug: 'autodesk', fallbackTo: '/categorias' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contato', to: '/quem-somos' }
] as const

type PaginaLinkDto = {
  titulo: string
  slug: string
}

type CategoriaLinkDto = {
  id: string
  nome: string
  slug: string
}

const { cart } = useCart()

const { data } = await useFetch<{ ok: true; paginas: PaginaLinkDto[] }>('/api/paginas', {
  server: true
})

const { data: categoriasData } = await useFetch<{ ok: true; categorias: CategoriaLinkDto[] }>('/api/categorias', {
  server: true
})

const paginas = computed(() => data.value?.paginas || [])
const categorias = computed(() => categoriasData.value?.categorias || [])

const categoriasSet = computed(() => {
  return new Set(categorias.value.map((c) => String(c.slug || '').trim()).filter(Boolean))
})

const mainMenu = computed(() => {
  return mainMenuBase.map((it) => {
    if ('to' in it) return it
    const slug = String(it.slug || '').trim()
    if (!slug) return { label: it.label, to: it.fallbackTo }
    if (categoriasSet.value.has(slug)) return { label: it.label, to: `/categoria/${slug}` }
    return { label: it.label, to: it.fallbackTo }
  })
})

const cartCount = computed(() => (cart.value || []).length)

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      home: 'Home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      searchPlaceholder: 'What are you looking for?',
      searchButton: 'Search',
      myAccount: 'My account',
      cart: 'Cart',
      goToCart: 'Go to cart',
      rightsReserved: 'All rights reserved.',
      footerDescription: 'Digital Windows and Office licenses with fast delivery after confirmation.',
      footerLinksTitle: 'Links',
      footerProducts: 'Products',
      footerTutorials: 'Tutorials',
      footerBlog: 'Blog',
      footerAbout: 'About us',
      footerDigitalDelivery: 'Digital delivery',
      footerRefundPolicy: 'Refund policy',
      footerPrivacy: 'Privacy',
      footerTerms: 'Terms of use',
      footerSupportTitle: 'Support',
      footerSupportSubtitle: 'Fast and specialized support',
      footerIntlSupport: 'International support in Portuguese, Spanish and English',
      whatsappPrefix: 'WhatsApp:',
      footerDisclaimer1: `${safeSiteName.value} (MERCADO SOFTWARES LTDA) is an independent company.`,
      footerDisclaimer2: 'We are not affiliated with Microsoft.'
    }
  }

  if (intl.language.value === 'es') {
    return {
      home: 'Inicio',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      searchPlaceholder: '¿Qué estás buscando?',
      searchButton: 'Buscar',
      myAccount: 'Mi cuenta',
      cart: 'Carrito',
      goToCart: 'Ir al carrito',
      rightsReserved: 'Todos los derechos reservados.',
      footerDescription: 'Licencias digitales de Windows y Office con envío rápido tras la confirmación.',
      footerLinksTitle: 'Enlaces',
      footerProducts: 'Productos',
      footerTutorials: 'Tutoriales',
      footerBlog: 'Blog',
      footerAbout: 'Quiénes somos',
      footerDigitalDelivery: 'Entrega digital',
      footerRefundPolicy: 'Política de reembolso',
      footerPrivacy: 'Privacidad',
      footerTerms: 'Términos de uso',
      footerSupportTitle: 'Soporte',
      footerSupportSubtitle: 'Atención rápida y especializada',
      footerIntlSupport: 'Atención internacional en Portugués, Español e Inglés',
      whatsappPrefix: 'WhatsApp:',
      footerDisclaimer1: `${safeSiteName.value} (MERCADO SOFTWARES LTDA) es una empresa independiente.`,
      footerDisclaimer2: 'No estamos afiliados a Microsoft.'
    }
  }

  return {
    home: 'Início',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    searchPlaceholder: 'O que está buscando?',
    searchButton: 'Buscar',
    myAccount: 'Minha conta',
    cart: 'Carrinho',
    goToCart: 'Ir para o carrinho',
    rightsReserved: 'Todos os direitos reservados.',
    footerDescription: 'Licenças digitais de Windows e Office com envio imediato após confirmação.',
    footerLinksTitle: 'Links',
    footerProducts: 'Produtos',
    footerTutorials: 'Tutoriais',
    footerBlog: 'Blog',
    footerAbout: 'Quem somos',
    footerDigitalDelivery: 'Entrega digital',
    footerRefundPolicy: 'Política de reembolso',
    footerPrivacy: 'Privacidade',
    footerTerms: 'Termos de uso',
    footerSupportTitle: 'Suporte',
    footerSupportSubtitle: 'Atendimento rápido e especializado',
    footerIntlSupport: 'Atendimento Internacional em Português, Espanhol e Inglês',
    whatsappPrefix: 'WhatsApp:',
    footerDisclaimer1: `${safeSiteName.value} (MERCADO SOFTWARES LTDA) é uma empresa independente.`,
    footerDisclaimer2: 'Não somos afiliados à Microsoft.'
  }
})

const footerDescriptionText = computed(() => {
  if (isLicencasDigitais.value) return 'Informações institucionais e canais oficiais de atendimento.'
  return t.value.footerDescription
})

const footerLinksTitleText = computed(() => {
  if (isLicencasDigitais.value) return 'Institucional'
  return t.value.footerLinksTitle
})

const footerInstitutionalLinks = computed(() => {
  return [
    { label: 'Sobre', to: '/quem-somos' },
    { label: 'Contato', to: '/quem-somos' },
    { label: 'Privacidade', to: '/privacidade' },
    { label: 'Termos', to: '/termos' },
    { label: 'Aviso legal', to: '/termos' }
  ]
})

function submitSearch() {
  const q = String(search.value || '').trim()
  if (!q) {
    navigateTo('/produtos')
    return
  }
  navigateTo({ path: '/produtos', query: { q } })
}

function onLangChange(e: Event) {
  const next = String((e.target as HTMLSelectElement)?.value || '').trim().toLowerCase()
  if (next === 'pt' || next === 'en' || next === 'es') {
    intl.setLanguage(next)
    if (!process.server) window.location.reload()
  }
}

function onCurrencyChange(e: Event) {
  const next = String((e.target as HTMLSelectElement)?.value || '').trim().toLowerCase()
  if (next === 'brl' || next === 'usd' || next === 'eur') {
    intl.setCurrency(next)
    if (!process.server) window.location.reload()
  }
}

function onCountryChange(e: Event) {
  const next = String((e.target as HTMLSelectElement)?.value || '').trim().toUpperCase()
  if (next === 'AUTO') {
    intl.setCountry('')
    if (!process.server) window.location.reload()
    return
  }

  intl.setCountry(next)

  const eur = new Set([
    'AT',
    'BE',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE',
    'NO',
    'IS',
    'LI',
    'CH',
    'GB'
  ])

  if (next === 'BR') intl.setCurrency('brl')
  else if (eur.has(next)) intl.setCurrency('eur')
  else intl.setCurrency('usd')

  if (next === 'ES') intl.setLanguage('es')
  else if (next === 'US' || next === 'GB') intl.setLanguage('en')
  else if (next === 'BR' || next === 'PT') intl.setLanguage('pt')

  if (!process.server) window.location.reload()
}

function menuIcon(label: string) {
  const k = String(label || '').toLowerCase()
  if (k.includes('windows server')) return '🖥️'
  if (k.includes('windows')) return '🪟'
  if (k.includes('office')) return '📄'
  if (k.includes('contato')) return '☎️'
  return '•'
}

const whatsappHref = computed(() => {
  const n = String(whatsappNumber || '').replace(/\D/g, '')
  if (!n) return ''
  return `https://wa.me/${n}`
})

const whatsappLabel = computed(() => {
  const n = String(whatsappNumber || '').replace(/\D/g, '')
  if (!n) return ''
  if (n.startsWith('55') && n.length === 13) {
    const ddd = n.slice(2, 4)
    const p1 = n.slice(4, 9)
    const p2 = n.slice(9)
    return `(${ddd}) ${p1}-${p2}`
  }
  return n
})
</script>
