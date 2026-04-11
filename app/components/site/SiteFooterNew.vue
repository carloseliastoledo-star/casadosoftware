<template>
  <footer class="bg-gray-900 text-gray-300 mt-20">

    <!-- Linha principal do footer -->
    <div class="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">

      <!-- Coluna 1: marca + descrição -->
      <div class="lg:col-span-1">
        <div class="font-extrabold text-white text-lg mb-3">{{ siteName }}</div>
        <p class="text-sm text-gray-400 leading-relaxed">{{ footerDescription }}</p>
        <div v-if="whatsappHref" class="mt-4">
          <a
            :href="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 transition"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.852L0 24l6.335-1.652A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-4.988-1.363l-.358-.213-3.76.981 1.002-3.662-.234-.376A9.797 9.797 0 012.182 12C2.182 6.564 6.564 2.182 12 2.182S21.818 6.564 21.818 12 17.436 21.818 12 21.818z"/>
            </svg>
            WhatsApp: {{ whatsappLabel }}
          </a>
        </div>
        <div v-if="supportEmail" class="mt-2">
          <a :href="`mailto:${supportEmail}`" class="text-sm text-gray-400 hover:text-white transition">
            {{ supportEmail }}
          </a>
        </div>
      </div>

      <!-- Coluna 2: produtos e categorias -->
      <div>
        <div class="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">{{ footerLinksTitle }}</div>
        <ul class="space-y-2 text-sm">
          <li><NuxtLink :to="productsIndexPath" class="hover:text-white transition">{{ t.footerProducts }}</NuxtLink></li>
          <li><NuxtLink to="/tutoriais" class="hover:text-white transition">{{ t.footerTutorials }}</NuxtLink></li>
          <li><NuxtLink :to="blogTo" class="hover:text-white transition">{{ t.footerBlog }}</NuxtLink></li>
          <li><NuxtLink :to="affiliateTo" class="hover:text-white transition">{{ affiliateLabel }}</NuxtLink></li>
          <li><NuxtLink :to="aboutUsPath" class="hover:text-white transition">{{ t.footerAbout }}</NuxtLink></li>
        </ul>
      </div>

      <!-- Coluna 3: políticas e páginas institucionais -->
      <div>
        <div class="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">{{ t.footerSupportTitle }}</div>
        <ul class="space-y-2 text-sm">
          <li><NuxtLink :to="digitalDeliveryPath" class="hover:text-white transition">{{ t.footerDigitalDelivery }}</NuxtLink></li>
          <li><NuxtLink :to="refundPolicyPath" class="hover:text-white transition">{{ t.footerRefundPolicy }}</NuxtLink></li>
          <li><NuxtLink :to="privacyPolicyPath" class="hover:text-white transition">{{ t.footerPrivacy }}</NuxtLink></li>
          <li><NuxtLink :to="termsOfUsePath" class="hover:text-white transition">{{ t.footerTerms }}</NuxtLink></li>
          <li v-for="p in paginas" :key="p.slug">
            <NuxtLink :to="`/paginas/${p.slug}`" class="hover:text-white transition">{{ p.titulo }}</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Coluna 4: dados da empresa -->
      <div>
        <div class="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">{{ t.footerSupportTitle }}</div>
        <p class="text-sm text-gray-400 mb-4">{{ t.footerIntlSupport }}</p>
        <div v-if="!isEnDomain" class="text-xs text-gray-500 space-y-1">
          <p v-if="companyLegalName"><span class="font-semibold text-gray-400">Razão Social:</span> {{ companyLegalName }}</p>
          <p v-if="companyCnpj"><span class="font-semibold text-gray-400">CNPJ:</span> {{ companyCnpj }}</p>
          <p v-if="companyAddress"><span class="font-semibold text-gray-400">Endereço:</span> {{ companyAddress }}</p>
          <p v-if="companyPhone"><span class="font-semibold text-gray-400">Telefone:</span> {{ companyPhone }}</p>
          <p v-if="companyEmail"><span class="font-semibold text-gray-400">E-mail:</span> {{ companyEmail }}</p>
        </div>
      </div>

    </div>

    <!-- Barra de copyright -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <span>© {{ year }} {{ siteName }} — {{ t.rightsReserved }}</span>
        <span class="text-gray-600">{{ t.footerDisclaimer1 }}</span>
      </div>
    </div>

  </footer>
</template>

<script setup lang="ts">
interface PaginaLink { titulo: string; slug: string }

interface Translations {
  footerProducts: string
  footerTutorials: string
  footerBlog: string
  footerAbout: string
  footerDigitalDelivery: string
  footerRefundPolicy: string
  footerPrivacy: string
  footerTerms: string
  footerSupportTitle: string
  footerIntlSupport: string
  rightsReserved: string
  footerDisclaimer1: string
}

interface Props {
  siteName: string
  supportEmail?: string
  whatsappHref?: string
  whatsappLabel?: string
  companyLegalName?: string
  companyCnpj?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  paginas?: PaginaLink[]
  productsIndexPath?: string
  blogTo?: string
  affiliateTo?: string
  affiliateLabel?: string
  aboutUsPath?: string
  digitalDeliveryPath?: string
  refundPolicyPath?: string
  privacyPolicyPath?: string
  termsOfUsePath?: string
  isEnDomain?: boolean
  footerDescription?: string
  footerLinksTitle?: string
  t: Translations
}

withDefaults(defineProps<Props>(), {
  paginas: () => [],
  productsIndexPath: '/produtos',
  blogTo: '/blog',
  affiliateTo: '/pt/programa-afiliados',
  affiliateLabel: 'Programa de Afiliados',
  aboutUsPath: '/quem-somos',
  digitalDeliveryPath: '/entrega-digital',
  refundPolicyPath: '/reembolso',
  privacyPolicyPath: '/privacidade',
  termsOfUsePath: '/termos',
  isEnDomain: false,
})

const year = new Date().getFullYear()
</script>
