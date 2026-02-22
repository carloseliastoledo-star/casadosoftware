<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Breadcrumb -->
      <div class="text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:underline">{{ t.home }}</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/produtos" class="hover:underline">{{ t.products }}</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-medium">{{ safeProduct.nome }}</span>
      </div>

      <!-- Título -->
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
        {{ pageH1 }}
      </h1>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        {{ t.loading }}
      </div>

      <!-- Erro -->
      <div v-else-if="error || !data" class="text-center py-20 text-red-600">
        {{ t.notFound }}
      </div>

      <!-- Card principal -->
      <div
        v-else
        class="bg-white rounded-2xl shadow p-8 grid lg:grid-cols-2 gap-10"
      >

        <!-- Imagem -->
        <div class="flex items-center justify-center">
          <img
            :src="safeImage"
            :alt="safeProduct.nome"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            width="520"
            height="520"
            sizes="(max-width: 1024px) 100vw, 520px"
            class="w-full max-w-[520px] max-h-[520px] object-contain"
            referrerpolicy="no-referrer"
            @error="onImageError"
          />
        </div>

        <!-- Coluna compra -->
        <div class="space-y-6">
          <div v-if="safeProduct.descricaoCurta" class="text-gray-600">
            {{ safeProduct.descricaoCurta }}
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div v-if="formattedOldPrice" class="text-gray-400 line-through">
                {{ formattedOldPrice }}
              </div>

              <span
                v-if="discountPercent"
                class="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1"
              >
                {{ discountPercent }}% OFF
              </span>
            </div>

            <div class="text-4xl font-extrabold text-gray-900">
              {{ formattedPrice }}
            </div>

            <div v-if="installments12" class="text-sm text-gray-600">
              {{ t.installmentsPrefix }} {{ installments12 }}
            </div>

            <div v-if="isBrl" class="text-sm text-blue-600">
              {{ t.pixLabel }}
              <span v-if="formattedPixPrice" class="text-gray-500">({{ formattedPixPrice }})</span>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.digitalDelivery }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.freeRefund }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.guarantee }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-600">✔</span>
              {{ t.emailDelivery }}
            </div>
          </div>

          <div class="space-y-3">
            <button
              type="button"
              @click="buyNow"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl transition"
            >
              {{ t.buy }}
            </button>
          </div>

          <div class="pt-2">
            <div class="text-lg font-semibold text-gray-900 mb-3">{{ t.included }}</div>
            <ul class="mt-6 space-y-2 text-gray-700">
              <li v-for="item in includedItems" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-green-600">
                    <path
                      fill-rule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.21a1 1 0 011.415-1.415l3.018 3.018 6.543-6.543a1 1 0 011.432.02z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                <span class="text-sm">{{ item }}</span>
              </li>
            </ul>
          </div>

          <div
            v-if="isMicrosoft365"
            class="rounded-xl border bg-gray-50 p-5 text-sm text-gray-700"
          >
            <div class="font-semibold text-gray-900">Microsoft 365 / Office 365 — como funciona</div>
            <ul class="mt-3 list-disc pl-5 space-y-2">
              <li>Assinatura anual (12 meses), conforme descrito no produto.</li>
              <li>Entrega por conta fornecida (login e senha) após a confirmação do pagamento.</li>
              <li>O acesso é feito com a conta fornecida (não é ativação em uma conta Microsoft pessoal já existente).</li>
            </ul>
            <div class="mt-3">
              Dúvidas? Consulte <NuxtLink class="text-blue-600 hover:underline" to="/entrega-digital">Entrega digital</NuxtLink>.
            </div>
          </div>
        </div>
      </div>

      <!-- BLOCO AZUL TUTORIAL -->
      <div
        v-if="data && safeProduct.tutorialTitulo"
        class="mt-12 border border-blue-500 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-50"
      >
        <div class="flex items-center gap-5">
          <div class="bg-blue-600 text-white p-4 rounded-xl text-xl">
            📘
          </div>

          <div>
            <h3 class="text-xl font-bold text-blue-700">
              {{ safeProduct.tutorialTitulo }}
            </h3>
            <p class="text-blue-700 text-sm mt-1">
              {{ safeProduct.tutorialSubtitulo }}
            </p>
          </div>
        </div>

        <NuxtLink
          :to="`/tutoriais/${safeProduct.slug}`"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          → Ver Tutorial
        </NuxtLink>
      </div>

      <!-- DESCRIÇÃO DETALHADA -->
      <div
        v-if="data"
        class="bg-white rounded-2xl shadow mt-12 p-8 space-y-10"
      >
        <section>
          <h2 class="text-2xl font-bold mb-3">
            Descrição Detalhada
          </h2>

          <div
            class="prose prose-gray max-w-none"
            v-html="safeDescriptionHtml"
          />
        </section>
      </div>

      <div
        v-if="data"
        class="bg-white rounded-2xl shadow mt-8 p-8"
      >
        <h2 class="text-2xl font-bold mb-3">Por que nosso preço é mais acessível?</h2>
        <p class="text-gray-700 leading-relaxed">
          Nossos preços são mais acessíveis porque trabalhamos com distribuição digital, sem custos de mídia física, logística ou intermediários.
        </p>
        <p class="text-gray-700 leading-relaxed mt-4">
          Isso nos permite oferecer valores competitivos, mantendo suporte e envio imediato após confirmação.
        </p>
      </div>

    </div>
  </section>

</template>

<script setup lang="ts">
import { useIntlContext } from '#imports'
import DOMPurify from 'isomorphic-dompurify'

definePageMeta({ ssr: true })

const intl = useIntlContext()

const { siteName } = useSiteBranding()

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const host = computed(() => {
  if (process.server) {
    try {
      const url = useRequestURL()
      if (url?.host) return String(url.host).toLowerCase()
    } catch {
      // ignore
    }

    try {
      const headers = useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>
      const raw = headers?.['x-forwarded-host'] || headers?.['x-original-host'] || headers?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
  }

  return String(window.location.host || '').toLowerCase()
})

const normalizedHost = computed(() => {
  const h0 = String(host.value || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
})

const isCasaDoSoftware = computed(() => {
  if (normalizedHost.value.includes('casadosoftware.com.br')) return true
  return storeSlug.value === 'casadosoftware'
})

const route = useRoute()
const slug = route.params.slug as string

const isOffice365FiveLicenses = computed(() => {
  const s = String(slug || '').trim().toLowerCase()
  return s === 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'
})

const pageH1 = computed(() => {
  if (isCasaDoSoftware.value && isOffice365FiveLicenses.value) {
    return 'Licença Office 365 Original para PC e Mac – Entrega Instantânea'
  }
  return String(safeProduct.value.nome || '')
})

const baseUrl = useSiteUrl()

const canonicalUrl = computed(() => {
  const s = String(slug || '').trim()
  if (!s) return baseUrl ? `${baseUrl}/` : ''
  return baseUrl ? `${baseUrl}/produto/${s}` : ''
})

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}`,
  { server: true }
)

const safeProduct = computed(() => {
  const p = data.value

  if (!p) {
    return {
      nome: '',
      descricao: '',
      descricaoCurta: '',
      preco: 0,
      imagem: '/products/placeholder.png'
    }
  }

  const nome = (p as any).nome ?? (p as any).name ?? ''
  const descricaoBase = (p as any).descricao ?? (p as any).description ?? ''
  const preco = Number((p as any).preco ?? (p as any).price ?? 0)
  const slugValue = (p as any).slug ?? ''

  const descricaoCurtaFromDb =
    (p as any).descricaoCurta ?? (p as any).shortDescription ?? (p as any).descricao_resumo ?? (p as any).resumo ?? ''

  const descricaoCurtaBase = String(descricaoCurtaFromDb || descricaoBase || '')
    .replace(/\s+/g, ' ')
    .trim()

  const descricaoCurta = descricaoCurtaBase.length > 220 ? `${descricaoCurtaBase.slice(0, 220)}...` : descricaoCurtaBase
  const descricaoLonga = String(descricaoBase || descricaoCurta || '').trim()

  return {
    ...p,
    nome,
    preco,
    imagem: (p as any).image || (p as any).imagem || '/products/placeholder.svg',
    slug: slugValue,
    currency: (p as any).currency || null,
    precoAntigo: Number((p as any).precoAntigo ?? (p as any).old_price ?? 0) || null,
    tutorialTitulo: (p as any).tutorialTitle || (p as any).tutorialTitulo || null,
    tutorialSubtitulo: (p as any).tutorialSubtitle || (p as any).tutorialSubtitulo || 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
    descricaoCurta,
    descricao: descricaoLonga
  }
})

const safeImage = computed(() => {
  const image = String((safeProduct.value as any)?.imagem || '')
  if (!image) return '/products/placeholder.svg'

  if (image.startsWith('http://')) {
    return image.replace(/^http:\/\//, 'https://')
  }

  return image
})

const absoluteImageUrl = computed(() => {
  const raw = String(safeImage.value || '').trim()
  if (!raw) return ''
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const origin = String(baseUrl || '').trim()
  if (!origin) return raw
  if (!raw.startsWith('/')) return `${origin}/${raw}`
  return `${origin}${raw}`
})

const seoTitle = computed(() => {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      return 'Licença Windows 11 Pro Original – Ativação Imediata | Casa do Software'
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      return 'Windows 10 Pro Original – Licença Digital Vitalícia | Casa do Software'
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        return 'Licença Microsoft 365 Original PC e Mac | Entrega imediata'
      }

      return 'Office 365 Original – Licença Oficial com Entrega Imediata'
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      return 'Office 2021 Original – Chave de Ativação Vitalícia | Casa do Software'
    }
  }

  const name = String((safeProduct.value as any)?.nome || '').trim()
  const base = String(siteName || 'Casa do Software')
  return name ? `${name} | ${base}` : base
})

const seoDescription = computed(() => {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '').trim().toLowerCase()
  if (isCasaDoSoftware.value) {
    if (slugValue.includes('windows-11') && slugValue.includes('pro')) {
      return 'Windows 11 Pro original com chave vitalícia e entrega na hora. Instale e ative em minutos com suporte completo. Compra segura!'
    }
    if (slugValue.includes('windows-10') && slugValue.includes('pro')) {
      return 'Compre Windows 10 Pro original com ativação instantânea e garantia. Licença vitalícia para PC ou notebook. Suporte incluso!'
    }
    if (slugValue.includes('office') && (slugValue.includes('365') || slugValue.includes('microsoft-365'))) {
      if (isOffice365FiveLicenses.value) {
        return 'Comprar licença do pacote Office permanente nunca foi tão fácil. Original, ativação rápida, conta oficial, suporte completo e envio imediato por email.'
      }

      return 'Microsoft Office 365 original para PC e Mac. Ativação rápida, conta oficial e suporte completo. Receba agora por e-mail!'
    }
    if (slugValue.includes('office') && slugValue.includes('2021')) {
      return 'Licença Office 2021 original com chave permanente e instalação simples. Entrega imediata e pagamento seguro. Ative em minutos!'
    }
  }

  const rawShort = String((safeProduct.value as any)?.descricaoCurta || '').trim()
  const rawLong = String((safeProduct.value as any)?.descricao || '').trim()

  const raw = rawShort || rawLong
  if (!raw) return ''

  const textOnly = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, ' ')
    .trim()

  return textOnly.length > 155 ? textOnly.slice(0, 155) : textOnly
})

useHead(() => {
  const title = seoTitle.value
  const description = seoDescription.value
  const link = canonicalUrl.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : []

  const p = safeProduct.value as any
  const hasProduct = !pending.value && !error.value && String(p?.nome || '').trim()

  if (!hasProduct) {
    return {
      title,
      meta: [{ name: 'description', content: description }],
      link
    }
  }

  const price = Number(p?.preco || 0)
  const priceCurrency = String(p?.currency || intl.currency.value || 'BRL')

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: String(p?.nome || '').trim() || undefined,
    description: String(description || '').trim() || undefined,
    image: absoluteImageUrl.value ? [absoluteImageUrl.value] : undefined,
    sku: String(p?.id || '').trim() || undefined,
    brand: {
      '@type': 'Brand',
      name: String(siteName || 'Casa do Software')
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl.value || undefined,
      priceCurrency,
      price: price > 0 ? price : undefined,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }

  return {
    title,
    meta: [{ name: 'description', content: description }],
    link,
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd)
      }
    ]
  }
})

const seoMetaTitle = computed(() => seoTitle.value)
const seoMetaDescription = computed(() => seoDescription.value)
useSeoMeta({
  title: seoMetaTitle,
  description: seoMetaDescription,
  ogTitle: seoMetaTitle,
  ogDescription: seoMetaDescription,
  twitterTitle: seoMetaTitle,
  twitterDescription: seoMetaDescription
})

const safeDescriptionHtml = computed(() => {
  const raw = String((safeProduct.value as any)?.descricao || '').trim()
  if (isCasaDoSoftware.value && isOffice365FiveLicenses.value && !raw) {
    const content = `
<h2>Licença Office 365 Original Microsoft (Entrega Digital)</h2>
<p>Tenha acesso ao pacote Office 365 original com os principais aplicativos da Microsoft para produtividade no dia a dia. Com a licença Office 365, você utiliza ferramentas como Word, Excel, PowerPoint, Outlook e OneNote, sempre com atualizações durante o período da assinatura.</p>
<p>Ideal para quem deseja comprar licença de forma segura, prática e com suporte especializado.</p>

<h3>O que está incluso no Pacote Office 365</h3>
<p>Ao adquirir a licença Office 365, você terá acesso a:</p>
<ul>
  <li>Word</li>
  <li>Excel</li>
  <li>PowerPoint</li>
  <li>Outlook</li>
  <li>OneNote</li>
  <li>Atualizações automáticas enquanto a assinatura estiver ativa</li>
</ul>
<p>Tudo em um único pacote, com acesso aos recursos mais recentes da Microsoft Office.</p>

<h3>Compatibilidade e uso da Licença Office 365</h3>
<p>A licença Office 365 pode ser utilizada em até 5 dispositivos simultaneamente, conforme as regras do serviço, incluindo:</p>
<ul>
  <li>PC</li>
  <li>Mac</li>
  <li>Tablet</li>
  <li>Smartphone</li>
</ul>
<p>Compatível com diferentes sistemas, ideal para quem trabalha ou estuda em mais de um dispositivo.</p>

<h2>Como funciona a entrega da Licença Office 365</h2>
<p>Após a confirmação do pagamento, a entrega é 100% digital:</p>
<ul>
  <li>Você recebe login e senha para acesso ao Microsoft 365</li>
  <li>A ativação é rápida e simples</li>
  <li>O acesso é válido pelo período contratado</li>
</ul>
<p>Nossa equipe oferece suporte em horário comercial para auxiliar no primeiro acesso, instalação e configuração da licença.</p>

<h3>Suporte e segurança</h3>
<p>Ao comprar a licença Office 365 na Casa do Software, você conta com:</p>
<ul>
  <li>Conta oficial</li>
  <li>Ativação segura</li>
  <li>Suporte para dúvidas iniciais e configuração</li>
</ul>
<p>Tudo para garantir uma experiência tranquila desde o primeiro acesso.</p>

<h3>Informações importantes</h3>
<ul>
  <li>Entrega digital, sem envio físico</li>
  <li>Guarde os dados de acesso para futuras referências</li>
  <li>Produto original Microsoft</li>
  <li>Licença válida conforme período contratado</li>
</ul>

<h2>FAQ</h2>

<h3>O que é licença 365?</h3>
<p>A licença 365 é o acesso ao Microsoft 365, que inclui aplicativos como Word, Excel, PowerPoint, Outlook e OneNote, com atualizações durante o período da assinatura.</p>

<h3>Qual é o valor da licença do Office 365?</h3>
<p>O valor da licença do Office 365 pode variar conforme o plano e o período contratado. Consulte o preço atualizado nesta página antes de finalizar a compra.</p>

<h3>Por que comprar licença do Microsoft Office 365?</h3>
<p>Ao comprar a licença do Microsoft Office 365, você garante acesso ao pacote Office original, com atualizações constantes, compatibilidade com vários dispositivos e suporte para ativação e uso.</p>

<h3>Como ativar o pacote Office 365?</h3>
<p>Após a confirmação do pagamento, você recebe login e senha por email para acessar o Microsoft 365. Basta fazer o login na conta informada e seguir as instruções para ativação nos dispositivos desejados. Caso precise, oferecemos suporte para ajudar na ativação.</p>

<h3>E se eu comprar e não receber a licença 365 no meu e-mail?</h3>
<p>Caso não localize o e-mail, verifique a caixa de spam ou lixo eletrônico. Se ainda assim não receber, basta entrar em contato com nosso suporte para que o envio seja verificado e resolvido rapidamente.</p>

<h3>A licença 365 da Casa do Software é oficial?</h3>
<p>Sim. A licença 365 da Casa do Software é original e oficial, com acesso por conta válida da Microsoft e ativação segura.</p>
`

    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true }
    })
  }
  if (!raw) return ''

  const hasHtml = /<\s*\/?\s*[a-z][\s\S]*>/i.test(raw)
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const isSimpleHtmlForConversion = (html: string) => {
    // Consider HTML "simple" when it only uses wrappers / line-break tags.
    // In this case we can safely convert it back to text lines and apply ##/### headings.
    const stripped = html
      .replace(/<\s*br\b[^>]*>/gi, '')
      .replace(/<\/?\s*(p|div|span)\b[^>]*>/gi, '')
      .trim()

    return !/<\s*\/?\s*[a-z][\s\S]*>/i.test(stripped)
  }

  const htmlToTextLines = (html: string) => {
    return html
      .replace(/<\s*br\b[^>]*>/gi, '\n')
      .replace(/<\s*\/\s*(p|div)\s*>/gi, '\n')
      .replace(/<\s*(p|div)\b[^>]*>/gi, '')
      .replace(/<\/?\s*span\b[^>]*>/gi, '')
      .replace(/&nbsp;/gi, ' ')
  }

  const convertHeadingsInsideHtml = (html: string) => {
    let out = html

    // Handle common block wrappers.
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*###\s*([\s\S]*?)\s*<\/\1>/gi,
      '<h3>$3</h3>'
    )
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*##\s*([\s\S]*?)\s*<\/\1>/gi,
      '<h2>$3</h2>'
    )

    // Handle cases where the marker is wrapped by inner tags (e.g. <p><strong>## Title</strong></p>).
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*(?:<[^>]+>\s*)*###\s*([\s\S]*?)\s*(?:<\/[^>]+>\s*)*<\/\1>/gi,
      '<h3>$3</h3>'
    )
    out = out.replace(
      /<(p|div|li|span)(\s[^>]*)?>\s*(?:<[^>]+>\s*)*##\s*([\s\S]*?)\s*(?:<\/[^>]+>\s*)*<\/\1>/gi,
      '<h2>$3</h2>'
    )

    // Handle headings after line breaks (keeps the rest of the HTML intact).
    // Capture until the next <br ...> so the heading content may contain tags (e.g. <strong>).
    out = out.replace(
      /(<\s*br\b[^>]*>\s*)###\s*([\s\S]*?)(?=<\s*br\b[^>]*>|$)/gi,
      '$1<h3>$2</h3>'
    )
    out = out.replace(
      /(<\s*br\b[^>]*>\s*)##\s*([\s\S]*?)(?=<\s*br\b[^>]*>|$)/gi,
      '$1<h2>$2</h2>'
    )

    // Handle headings at the beginning of the HTML.
    out = out.replace(/^\s*###\s*([^<\n\r]+)/i, '<h3>$1</h3>')
    out = out.replace(/^\s*##\s*([^<\n\r]+)/i, '<h2>$1</h2>')

    return out
  }

  const renderPlainText = (text: string) => {
    const lines = text.replace(/\r\n/g, '\n').split('\n')
    return lines
      .map((line) => {
        if (isCasaDoSoftware.value) {
          const h3 = line.match(/^\s*###\s*(.+)\s*$/)
          if (h3) return `<h3>${escapeHtml(h3[1] || '')}</h3>`

          const h2 = line.match(/^\s*##\s*(.+)\s*$/)
          if (h2) return `<h2>${escapeHtml(h2[1] || '')}</h2>`
        }

        return escapeHtml(line)
      })
      .join('<br />')
  }

  const normalized = (() => {
    if (!hasHtml) return renderPlainText(raw)

    if (isCasaDoSoftware.value && isSimpleHtmlForConversion(raw)) {
      return renderPlainText(htmlToTextLines(raw))
    }

    if (isCasaDoSoftware.value && /(^|[\n\r]|<\s*br\b[^>]*>)\s*##/i.test(raw)) {
      return convertHeadingsInsideHtml(raw)
    }

    return raw
  })()

  return DOMPurify.sanitize(normalized, {
    USE_PROFILES: { html: true }
  })
})

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement | null
  if (!el) return
  if (el.src.endsWith('/products/placeholder.svg')) return
  el.src = '/products/placeholder.svg'
}

const isBrl = computed(() => intl.currencyLower.value === 'brl')

const formattedPrice = computed(() => {
  const currencyLower = String((safeProduct.value as any)?.currency || intl.currencyLower.value).trim().toLowerCase()
  const currency = currencyLower === 'usd' ? 'USD' : currencyLower === 'eur' ? 'EUR' : 'BRL'
  return Number(safeProduct.value.preco || 0).toLocaleString(intl.locale.value, {
    style: 'currency',
    currency
  })
})

const formattedOldPrice = computed(() => {
  const oldPrice = (safeProduct.value as any).precoAntigo
  if (!oldPrice || Number.isNaN(Number(oldPrice))) return null
  if (Number(oldPrice) <= Number(safeProduct.value.preco || 0)) return null

  const currencyLower = String((safeProduct.value as any)?.currency || intl.currencyLower.value).trim().toLowerCase()
  const currency = currencyLower === 'usd' ? 'USD' : currencyLower === 'eur' ? 'EUR' : 'BRL'
  return Number(oldPrice).toLocaleString(intl.locale.value, {
    style: 'currency',
    currency
  })
})

const discountPercent = computed(() => {
  const oldPrice = (safeProduct.value as any).precoAntigo
  const current = Number(safeProduct.value.preco || 0)
  if (!oldPrice || !current) return null
  const oldN = Number(oldPrice)
  if (!oldN || oldN <= current) return null
  return Math.round((1 - current / oldN) * 100)
})

const formattedPixPrice = computed(() => {
  if (!isBrl.value) return null
  const price = Number(safeProduct.value.preco || 0)
  if (!price) return null
  const pixPrice = Math.round(price * 0.95 * 100) / 100
  if (pixPrice === price) return null
  return pixPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const installments12 = computed(() => {
  if (!isBrl.value) return null
  const price = Number(safeProduct.value.preco || 0)
  if (!price) return null
  const value = Math.round((price / 12) * 100) / 100
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const defaultIncludedItems = [
  'Envio imediato após confirmação',
  'Licença digital permanente',
  'Suporte em horário comercial',
  '1 PC',
  'Versão profissional com recursos avançados',
  'Compatível Windows 10 e 11',
  'Ativação permanente',
  'Sem renovação necessária'
]

const includedItems = computed(() => {
  const raw = String((safeProduct.value as any)?.cardItems ?? '').trim()
  if (!raw) return defaultIncludedItems
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : defaultIncludedItems
})

const isMicrosoft365 = computed(() => {
  const nome = String((safeProduct.value as any)?.nome || '').toLowerCase()
  const slugValue = String((safeProduct.value as any)?.slug || '').toLowerCase()
  return (
    nome.includes('microsoft 365') ||
    nome.includes('office 365') ||
    slugValue.includes('microsoft-365') ||
    slugValue.includes('office-365') ||
    slugValue.includes('365')
  )
})

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      home: 'Home',
      products: 'Products',
      loading: 'Loading product...',
      notFound: 'Product not found.',
      buy: 'Buy',
      included: "What's included:",
      installmentsPrefix: 'up to 12x of',
      pixLabel: 'PIX upfront payment',
      digitalDelivery: 'Digital delivery • Available',
      freeRefund: 'Free refund up to 7 days after purchase',
      guarantee: 'Guaranteed purchase. If you are not satisfied, we refund you',
      emailDelivery: 'Delivered by email after confirmation'
    }
  }

  if (intl.language.value === 'es') {
    return {
      home: 'Inicio',
      products: 'Productos',
      loading: 'Cargando producto...',
      notFound: 'Producto no encontrado.',
      buy: 'Comprar',
      included: 'Qué incluye:',
      installmentsPrefix: 'hasta 12x de',
      pixLabel: 'Pago al contado con PIX',
      digitalDelivery: 'Entrega digital • Disponible',
      freeRefund: 'Devolución gratis hasta 7 días después de la compra',
      guarantee: 'Compra garantizada. Si no queda satisfecho, le devolvemos su dinero',
      emailDelivery: 'Envío por e-mail tras la confirmación'
    }
  }

  return {
    home: 'Início',
    products: 'Produtos',
    loading: 'Carregando produto...',
    notFound: 'Produto não encontrado.',
    buy: 'Comprar',
    included: 'O que está incluído:',
    installmentsPrefix: 'em até 12x de',
    pixLabel: 'Pagamento à vista no PIX',
    digitalDelivery: 'Entrega digital • Disponível',
    freeRefund: 'Devolução grátis. Até 7 dias a partir do recebimento',
    guarantee: 'Compra garantida. Saia satisfeito ou devolvemos seu dinheiro',
    emailDelivery: 'Envio por e-mail após confirmação'
  }
})

function buyNow() {
  const slugValue = String((safeProduct.value as any)?.slug || slug || '')
  navigateTo({ path: '/checkout', query: { product: slugValue } })
}
</script>
