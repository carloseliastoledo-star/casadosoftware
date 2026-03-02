<template>
  <section class="bg-gray-50">
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-6 pt-8 pb-10">
        <div
          v-if="isLicencasDigitais"
          class="rounded-3xl overflow-hidden border border-black/10 shadow-sm bg-[#eef6fb]"
        >
          <div class="grid md:grid-cols-2 gap-0">
            <div class="relative min-h-[240px] md:min-h-[300px] lg:min-h-[340px]">
              <img
                src="/licencasdigitais-gvg/hero-woman.png"
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />

              <div class="relative z-10 p-6 md:p-10">
                <div class="max-w-sm">
                  <div class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                    Promotion of
                    <span class="block">the Week!</span>
                  </div>
                  <p class="mt-3 text-sm text-gray-700">
                    Take advantage of special
                    <br />
                    offers on GVGMALL!
                  </p>

                  <div class="mt-6">
                    <NuxtLink
                      to="/produtos"
                      class="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-gray-900 font-semibold border border-black/10 hover:bg-gray-50"
                    >
                      Shop now
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative min-h-[240px] md:min-h-[300px] lg:min-h-[340px] bg-[#eef6fb]">
              <div class="relative z-10 p-6 md:p-10 h-full flex items-center">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center w-full">
                  <div>
                    <div class="text-2xl md:text-3xl font-extrabold text-gray-900">
                      Windows 11 Pro +
                      <span class="block">Office 365 Pro</span>
                    </div>
                    <p class="mt-3 text-sm text-gray-700 max-w-xs">
                      Get the ultimate productivity
                      <br />
                      and security package!
                    </p>
                    <div class="mt-6">
                      <NuxtLink
                        to="/produto/microsoft-office-365-vitalicio-microsoft-windows-11-pro-1-licenca"
                        class="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-gray-900 font-semibold border border-black/10 hover:bg-gray-50"
                      >
                        Buy Now
                      </NuxtLink>
                    </div>
                  </div>

                  <div class="flex justify-center sm:justify-end">
                    <img
                      src="/licencasdigitais-gvg/promo.png"
                      alt=""
                      class="w-[220px] md:w-[260px] lg:w-[280px] h-auto"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLicencasDigitais && onlyBestSellers" class="mt-10">
          <div class="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div class="inline-flex items-end gap-3">
                <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ t.bestSellersTitle }}</h2>
                <span class="hidden md:block h-[3px] w-16 bg-blue-600 rounded-full mb-1" />
              </div>
            </div>
            <NuxtLink to="/produtos" class="text-sm font-semibold text-gray-800 hover:underline">
              {{ t.viewAll }}
            </NuxtLink>
          </div>

          <div v-if="pending" class="text-center py-16 text-gray-500">
            {{ t.loadingProducts }}
          </div>

          <div v-else-if="error" class="text-center py-16 text-red-600">
            {{ t.errorProducts }}
          </div>

          <div v-else class="mt-8 relative">
            <button
              type="button"
              class="hidden md:inline-flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-gray-50"
              aria-label="Previous"
              @click="scrollBestSellers(-1)"
            >
              ‹
            </button>
            <button
              type="button"
              class="hidden md:inline-flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-gray-50"
              aria-label="Next"
              @click="scrollBestSellers(1)"
            >
              ›
            </button>

            <div
              ref="bestSellersRow"
              class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-2 px-2"
            >
              <div
                v-for="product in products"
                :key="product.id + (product.imagem || product.image || '')"
                class="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-[320px]"
              >
                <ProductCard :product="product" />
              </div>
            </div>
          </div>

          <div class="mt-16">
            <div class="text-center">
              <h2 class="text-4xl md:text-5xl font-light text-slate-700">Releases</h2>
            </div>

            <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <ProductCard
                v-for="product in releases"
                :key="String(product.id) + '-release'"
                :product="product"
              />
            </div>
          </div>

          <div class="mt-16">
            <div class="max-w-5xl mx-auto">
              <div class="rounded-2xl overflow-hidden border bg-black">
                <div class="relative w-full" style="padding-top: 56.25%">
                  <iframe
                    class="absolute inset-0 w-full h-full"
                    :src="homeVideoEmbedUrl"
                    title="Introducing Windows 11"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-16 bg-white border rounded-2xl">
            <div class="max-w-7xl mx-auto px-6 py-12">
              <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-center">
                <div>
                  <div class="mx-auto w-14 h-14 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-2xl">✉</div>
                  <div class="mt-4 font-extrabold text-sm tracking-widest text-gray-900">E-MAILING</div>
                  <div class="mt-2 text-sm text-gray-500">Immediate shipping, delivery time up to 90 minutes.</div>
                </div>
                <div>
                  <div class="mx-auto w-14 h-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-2xl">🛒</div>
                  <div class="mt-4 font-extrabold text-sm tracking-widest text-gray-900">MONITORED ORDER</div>
                  <div class="mt-2 text-sm text-gray-500">Receive your order in the comfort of your own home with delivery digital e-mail.</div>
                </div>
                <div>
                  <div class="mx-auto w-14 h-14 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-2xl">🎧</div>
                  <div class="mt-4 font-extrabold text-sm tracking-widest text-gray-900">NEED ASSISTANCE?</div>
                  <div class="mt-2 text-sm text-gray-500">High-quality support team available 24/7.</div>
                </div>
                <div>
                  <div class="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">🔒</div>
                  <div class="mt-4 font-extrabold text-sm tracking-widest text-gray-900">SECURE PURCHASE</div>
                  <div class="mt-2 text-sm text-gray-500">100% secure technology, site protected with SSL Certificate.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 overflow-hidden border border-black/10 shadow-sm">
          <div class="px-6 py-10 md:px-12 md:py-14">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-orange-200 bg-orange-500/15 border border-orange-500/20 px-3 py-1 rounded-full">
                {{ t.heroBadge }}
              </div>
              <h1 class="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                {{ t.heroTitle }}
                <span class="block text-cyan-300">{{ t.heroSubtitle }}</span>
              </h1>
              <p class="mt-4 text-white/80 text-sm md:text-base leading-relaxed">
                {{ t.heroDescription }}
              </p>

              <div class="mt-6 flex flex-col sm:flex-row gap-3">
                <NuxtLink
                  to="/produtos"
                  class="bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-extrabold px-6 py-3 rounded-xl transition text-center"
                >
                  {{ t.heroPrimaryCta }}
                </NuxtLink>
                <NuxtLink
                  to="/tutoriais"
                  class="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl transition text-center"
                >
                  {{ t.heroSecondaryCta }}
                </NuxtLink>
              </div>

              <div class="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-white/85">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-300">✔</span>
                  {{ t.heroBullet1 }}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-300">✔</span>
                  {{ t.heroBullet2 }}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-300">✔</span>
                  {{ t.heroBullet3 }}
                </div>
              </div>

              <div class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/10 border border-white/15 px-3 py-2 rounded-xl w-fit">
                <span class="text-emerald-300">✔</span>
                {{ t.heroIntl }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="!onlyBestSellers" class="mt-8 bg-white border rounded-2xl p-6 md:p-8">
          <div class="text-xs font-bold tracking-widest text-gray-500">{{ t.institutionalTitle }}</div>
          <div class="mt-3 space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              {{ t.institutionalP1 }}
            </p>
            <p>
              {{ t.institutionalP2 }}
            </p>
            <p>
              {{ t.institutionalP3 }}
            </p>
          </div>
        </div>

        <div v-if="!onlyBestSellers" class="mt-8 overflow-x-auto">
          <div class="flex gap-6 w-max md:mx-auto py-2 px-2 md:px-0">
            <NuxtLink
              v-for="it in categoriasAtalhos"
              :key="it.slug"
              :to="it.to"
              class="flex flex-col items-center gap-3"
            >
              <div class="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                <span class="text-2xl" aria-hidden="true">{{ it.icon }}</span>
              </div>
              <div class="text-xs font-semibold text-gray-700">{{ it.label }}</div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="bg-white border-y">
      <div class="max-w-7xl mx-auto px-6 py-10">
        <h2 class="text-2xl font-extrabold text-gray-900 text-center">{{ t.whyTitle }}</h2>
        <p class="text-gray-600 text-center mt-2">
          {{ t.whySubtitle }}
        </p>

        <div class="mt-8 grid md:grid-cols-4 gap-5">
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">⚡</div>
            <div class="font-bold mt-3">{{ t.whyCard1Title }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ t.whyCard1Body }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">💳</div>
            <div class="font-bold mt-3">{{ t.whyCard2Title }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ t.whyCard2Body }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">🧑‍�</div>
            <div class="font-bold mt-3">{{ t.whyCard3Title }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ t.whyCard3Body }}</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">🌍</div>
            <div class="font-bold mt-3">{{ t.whyCard4Title }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ t.whyCard4Body }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="bg-gray-50 border-b">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">{{ t.categoriesTitle }}</h2>
            <p class="text-gray-600 mt-2">{{ t.categoriesSubtitle }}</p>
          </div>
          <NuxtLink
            to="/categorias"
            class="text-blue-700 font-semibold hover:underline"
          >
            {{ t.categoriesViewAll }} →
          </NuxtLink>
        </div>

        <div class="mt-8 grid gap-4 lg:grid-cols-3">
          <NuxtLink
            v-for="c in categoriasDestaque"
            :key="c.slug"
            :to="c.to"
            class="bg-white border rounded-2xl p-6 hover:shadow-sm transition"
          >
            <div class="text-xs text-gray-500 tracking-widest">{{ t.categoryBadge }}</div>
            <div class="mt-2 text-xl font-extrabold text-gray-900">{{ c.label }}</div>
            <div class="mt-3 text-blue-700 font-semibold">{{ t.viewAllInline }} →</div>
          </NuxtLink>
        </div>

        <div v-if="categoriasPending" class="text-center py-12 text-gray-500">
          {{ t.loadingCategories }}
        </div>

        <div v-else-if="categoriasError" class="text-center py-12 text-red-600">
          {{ t.errorCategories }}
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div class="inline-flex items-end gap-3">
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ t.bestSellersTitle }}</h2>
            <span class="hidden md:block h-[3px] w-16 bg-blue-600 rounded-full mb-1" />
          </div>
        </div>
        <NuxtLink to="/produtos" class="text-sm font-semibold text-gray-800 hover:underline">
          {{ t.viewAll }}
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-16 text-gray-500">
        {{ t.loadingProducts }}
      </div>

      <div v-else-if="error" class="text-center py-16 text-red-600">
        {{ t.errorProducts }}
      </div>

      <div v-else-if="isLicencasDigitais" class="mt-8 relative">
        <button
          type="button"
          class="hidden md:inline-flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-gray-50"
          aria-label="Previous"
          @click="scrollBestSellers(-1)"
        >
          ‹
        </button>
        <button
          type="button"
          class="hidden md:inline-flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-gray-50"
          aria-label="Next"
          @click="scrollBestSellers(1)"
        >
          ›
        </button>

        <div
          ref="bestSellersRow"
          class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-2 px-2"
        >
          <div
            v-for="product in products"
            :key="product.id + (product.imagem || product.image || '')"
            class="snap-start shrink-0 w-[280px] sm:w-[320px] lg:w-[320px]"
          >
            <ProductCard :product="product" />
          </div>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in products"
          :key="product.id + (product.imagem || product.image || '')"
          :product="product"
        />
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="bg-gray-50 border-y">
      <div class="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div v-for="section in vitrines" :key="section.title">
          <div class="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 class="text-3xl font-extrabold text-gray-900">{{ section.title }}</h2>
              <p class="text-gray-600 mt-2">{{ section.subtitle }}</p>
            </div>
            <NuxtLink
              :to="section.to"
              class="text-blue-700 font-semibold hover:underline"
            >
              {{ t.viewAllInline }} →
            </NuxtLink>
          </div>

          <div v-if="!section.items.length" class="text-center py-10 text-gray-500">
            {{ t.comingSoon }}
          </div>

          <div v-else class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <ProductCard
              v-for="product in section.items"
              :key="product.id + (product.imagem || product.image || '') + section.title"
              :product="product"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">{{ t.testimonialsTitle }}</h2>
          <p class="text-gray-600 mt-2">{{ t.testimonialsSubtitle }}</p>
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <div
            v-for="(t, idx) in testimonials"
            :key="idx"
            class="bg-white border rounded-2xl p-6 shadow-sm"
          >
            <div class="text-amber-400 text-sm tracking-wide">★★★★★</div>
            <p class="text-gray-700 mt-4 leading-relaxed">“{{ t.texto }}”</p>

            <div class="mt-6 flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                :class="t.cor"
              >
                {{ t.inicial }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">{{ t.nome }}</div>
                <div class="text-xs text-gray-500">{{ t.tempo }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">{{ t.howItWorksTitle }}</h2>
            <p class="text-gray-600 mt-2">
              {{ t.howItWorksSubtitle }}
            </p>

            <div class="mt-6 space-y-4">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <div class="font-bold text-gray-900">{{ t.step1Title }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ t.step1Body }}</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <div class="font-bold text-gray-900">{{ t.step2Title }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ t.step2Body }}</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <div class="font-bold text-gray-900">{{ t.step3Title }}</div>
                  <div class="text-gray-600 text-sm mt-1">{{ t.step3Body }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <div class="text-blue-700 font-semibold">{{ t.helpNeedHelp }}</div>
            <div class="text-2xl font-extrabold text-gray-900 mt-2">{{ t.helpTitle }}</div>
            <p class="text-gray-700 mt-3">
              {{ t.helpBody }}
            </p>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <NuxtLink
                to="/produtos"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                {{ t.helpCtaBuy }}
              </NuxtLink>
              <NuxtLink
                to="/tutoriais"
                class="border border-blue-600 text-blue-700 hover:bg-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                {{ t.helpCtaTutorials }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!onlyBestSellers" class="max-w-7xl mx-auto px-6 py-12">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">{{ t.faqTitle }}</h2>
        <p class="text-gray-600 mt-2">{{ t.faqSubtitle }}</p>
      </div>

      <div class="mt-8 max-w-3xl mx-auto space-y-3">
        <button
          v-for="(item, idx) in faqs"
          :key="idx"
          type="button"
          class="w-full text-left bg-white border rounded-2xl px-5 py-4 hover:border-blue-200 transition"
          @click="toggleFaq(idx)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="font-semibold text-gray-900">
              {{ item.q }}
            </div>
            <div class="text-blue-700 font-bold">
              {{ openFaq === idx ? '−' : '+' }}
            </div>
          </div>
          <div
            v-if="openFaq === idx"
            class="mt-3 text-gray-600 text-sm leading-relaxed"
          >
            {{ item.a }}
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ onlyBestSellers?: boolean }>()
const onlyBestSellers = computed(() => Boolean(props.onlyBestSellers))

const intl = useIntlContext()

const config = useRuntimeConfig()
const storeSlug = computed(() => String((config.public as any)?.storeSlug || '').trim())

const requestUrl = import.meta.server ? useRequestURL() : null
const requestHeaders = import.meta.server
  ? (useRequestHeaders(['x-forwarded-host', 'x-original-host', 'host']) as Record<string, string | undefined>)
  : null

const host = computed(() => {
  if (import.meta.server) {
    try {
      if (requestUrl?.host) return String(requestUrl.host).toLowerCase()
    } catch {
      // ignore
    }

    try {
      const raw =
        requestHeaders?.['x-forwarded-host'] || requestHeaders?.['x-original-host'] || requestHeaders?.host || ''
      const first = String(raw).split(',')[0]?.trim()
      return String(first || '').toLowerCase()
    } catch {
      return ''
    }
  }

  if (typeof window !== 'undefined') {
    return String(window.location.host || '').toLowerCase()
  }

  return ''
})

const normalizedHost = computed(() => {
  const h0 = String(host.value || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
})

const isLicencasDigitais = computed(() => {
  if (normalizedHost.value.includes('licencasdigitais.com.br')) return true
  return storeSlug.value === 'licencasdigitais'
})

const { data, pending, error } = await useFetch<any[]>('/api/products/best-sellers', {
  server: true
})

const { data: siteSettings } = await useFetch('/api/site-settings', { server: true })

const products = computed(() => (data.value as any[]) || [])

const releases = computed(() => {
  return products.value.slice(0, 4)
})

const bestSellersRow = ref<HTMLElement | null>(null)

const homeVideoEmbedUrl = computed(() => {
  const raw = String((siteSettings.value as any)?.settings?.homeVideoUrl || '').trim()
  if (!raw) return 'https://www.youtube.com/embed/RUhFQxk4mV0'

  try {
    const url = new URL(raw)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').trim()
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`
    }

    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v') || ''
      if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`
      if (url.pathname.startsWith('/embed/')) return raw
    }
  } catch {
    // ignore
  }

  return raw
})

function scrollBestSellers(direction: 1 | -1) {
  const el = bestSellersRow.value
  if (!el) return
  const delta = Math.max(280, Math.round(el.clientWidth * 0.9))
  el.scrollBy({ left: direction * delta, behavior: 'smooth' })
}

const {
  data: categoriasData,
  pending: categoriasPending,
  error: categoriasError
} = await useFetch<{ ok: true; categorias: any[] }>('/api/categorias', {
  server: true
})

const t = computed(() => {
  if (intl.language.value === 'en') {
    return {
      heroBadge: 'Microsoft Partner Network',
      heroTitle: 'Digital Licenses',
      heroSubtitle: 'delivered by email',
      heroDescription: 'Windows, Office and Windows Server with fast digital delivery after confirmation.',
      heroPrimaryCta: 'View deals',
      heroSecondaryCta: 'How to activate',
      heroBullet1: 'Fast delivery after confirmation',
      heroBullet2: 'Digital delivery',
      heroBullet3: 'Specialized support',
      heroIntl: 'International Support in Portuguese, Spanish and English',
      institutionalTitle: 'INSTITUTIONAL',
      institutionalP1: 'We are an independent company specialized in the sale of digital software licenses for personal and professional use.',
      institutionalP2: 'We work with operating systems and productivity apps in digital versions, with one-time payment and online activation.',
      institutionalP3: 'We are not the official store of any brand. All mentioned trademarks belong to their respective owners.',
      whyTitle: 'Why choose',
      whySubtitle: 'A simple and secure experience from start to finish.',
      whyCard1Title: 'Instant Digital Delivery',
      whyCard1Body: 'Automatic email delivery after payment confirmation.',
      whyCard2Title: 'One-time Payment',
      whyCard2Body: 'No recurring charges or subscriptions.',
      whyCard3Title: 'Activation Support',
      whyCard3Body: 'Remote assistance to help with installation.',
      whyCard4Title: 'International Support',
      whyCard4Body: 'Português • Español • English',
      bestSellersTitle: 'Best sellers',
      viewAll: 'View all',
      categoriesTitle: 'Categories',
      categoriesSubtitle: 'Quickly find what you need.',
      categoriesViewAll: 'View all',
      categoryBadge: 'CATEGORY',
      viewAllInline: 'View all',
      loadingCategories: 'Loading categories...',
      errorCategories: 'Error loading categories.',
      loadingProducts: 'Loading products...',
      errorProducts: 'Error loading products.',
      comingSoon: 'Coming soon.',
      testimonialsTitle: 'What our customers say',
      testimonialsSubtitle: 'Real reviews from customers who have already purchased with us',
      howItWorksTitle: 'How it works',
      howItWorksSubtitle: 'A simple process: choose, pay and receive your key.',
      step1Title: 'Choose the product',
      step1Body: 'See the details and select the ideal option.',
      step2Title: 'Complete the payment',
      step2Body: 'Online payment with fast confirmation.',
      step3Title: 'Activate with the tutorial',
      step3Body: 'Follow the step-by-step tutorial for your product.',
      helpNeedHelp: 'Need help?',
      helpTitle: 'Count on specialized support',
      helpBody: 'If you have any questions during activation, our support can guide you.',
      helpCtaBuy: 'Buy now',
      helpCtaTutorials: 'View tutorials',
      faqTitle: 'Frequently asked questions',
      faqSubtitle: 'Clear your doubts before buying.',
      vitrineWindowsSubtitle: 'Digital Windows licenses delivered by email.',
      vitrineOfficeSubtitle: 'Office suites and Microsoft 365 for your day-to-day.',
      vitrineWindowsServerSubtitle: 'Licenses for servers and corporate environments.',
      shortcutAntivirus: 'Antivirus',
      shortcutBestSellers: 'Best sellers'
    }
  }

  if (intl.language.value === 'es') {
    return {
      heroBadge: 'Microsoft Partner Network',
      heroTitle: 'Licencias Digitales',
      heroSubtitle: 'con envío por e-mail',
      heroDescription: 'Windows, Office y Windows Server con entrega digital rápida tras la confirmación.',
      heroPrimaryCta: 'Ver ofertas',
      heroSecondaryCta: 'Cómo activar',
      heroBullet1: 'Envío rápido tras la confirmación',
      heroBullet2: 'Entrega digital',
      heroBullet3: 'Soporte especializado',
      heroIntl: 'Atención Internacional en Portugués, Español e Inglés',
      institutionalTitle: 'INSTITUCIONAL',
      institutionalP1: 'Somos una empresa independiente especializada en la comercialización de licencias digitales de software para uso personal y profesional.',
      institutionalP2: 'Trabajamos con sistemas operativos y aplicaciones de productividad en versiones digitales, con pago único y activación online.',
      institutionalP3: 'No somos la tienda oficial de ninguna marca. Todas las marcas citadas pertenecen a sus respectivos propietarios.',
      whyTitle: 'Por qué elegir',
      whySubtitle: 'Una experiencia simple y segura de principio a fin.',
      whyCard1Title: 'Entrega Digital Inmediata',
      whyCard1Body: 'Envío automático por e-mail tras la confirmación del pago.',
      whyCard2Title: 'Pago Único',
      whyCard2Body: 'Sin cargos recurrentes o mensualidades.',
      whyCard3Title: 'Soporte para Activación',
      whyCard3Body: 'Atención remota para ayudar con la instalación.',
      whyCard4Title: 'Atención Internacional',
      whyCard4Body: 'Português • Español • English',
      bestSellersTitle: 'Más vendidos',
      viewAll: 'Ver todos',
      categoriesTitle: 'Categorías',
      categoriesSubtitle: 'Encuentra rápidamente lo que necesitas.',
      categoriesViewAll: 'Ver todas',
      categoryBadge: 'CATEGORÍA',
      viewAllInline: 'Ver todo',
      loadingCategories: 'Cargando categorías...',
      errorCategories: 'Error al cargar categorías.',
      loadingProducts: 'Cargando productos...',
      errorProducts: 'Error al cargar productos.',
      comingSoon: 'Próximamente.',
      testimonialsTitle: 'Lo que dicen nuestros clientes',
      testimonialsSubtitle: 'Reseñas reales de quienes ya compraron con nosotros',
      howItWorksTitle: 'Cómo funciona',
      howItWorksSubtitle: 'Un proceso simple: elige, paga y recibe tu clave.',
      step1Title: 'Elige el producto',
      step1Body: 'Mira los detalles y selecciona la opción ideal.',
      step2Title: 'Finaliza el pago',
      step2Body: 'Pago online con confirmación rápida.',
      step3Title: 'Activa con el tutorial',
      step3Body: 'Sigue el paso a paso del tutorial de tu producto.',
      helpNeedHelp: '¿Necesitas ayuda?',
      helpTitle: 'Cuenta con soporte especializado',
      helpBody: 'Si tienes cualquier duda durante la activación, nuestro soporte puede orientarte.',
      helpCtaBuy: 'Comprar ahora',
      helpCtaTutorials: 'Ver tutoriales',
      faqTitle: 'Preguntas frecuentes',
      faqSubtitle: 'Resuelve tus dudas antes de comprar.',
      vitrineWindowsSubtitle: 'Licencias digitales de Windows con envío por e-mail.',
      vitrineOfficeSubtitle: 'Paquetes Office y Microsoft 365 para tu día a día.',
      vitrineWindowsServerSubtitle: 'Licencias para servidores y entornos corporativos.',
      shortcutAntivirus: 'Antivirus',
      shortcutBestSellers: 'Más vendidos'
    }
  }

  return {
    heroBadge: 'Parceiro Microsoft Network',
    heroTitle: 'Licenças Digitais',
    heroSubtitle: 'com envio por e-mail',
    heroDescription: 'Windows, Office e Windows Server com entrega digital rápida após confirmação.',
    heroPrimaryCta: 'Ver ofertas',
    heroSecondaryCta: 'Como ativar',
    heroBullet1: 'Envio rápido após confirmação',
    heroBullet2: 'Entrega digital',
    heroBullet3: 'Suporte especializado',
    heroIntl: 'Atendimento Internacional em Português, Espanhol e Inglês',
    institutionalTitle: 'INSTITUCIONAL',
    institutionalP1: 'Somos uma empresa independente especializada na comercialização de licenças digitais de software para uso pessoal e profissional.',
    institutionalP2: 'Trabalhamos com sistemas operacionais e aplicativos de produtividade em versões digitais, com pagamento único e ativação online.',
    institutionalP3: 'Não somos a loja oficial de nenhuma marca. Todas as marcas citadas pertencem aos seus respectivos proprietários.',
    whyTitle: 'Por que escolher',
    whySubtitle: 'Uma experiência simples e segura do início ao fim.',
    whyCard1Title: 'Entrega Digital Imediata',
    whyCard1Body: 'Envio automático por e-mail após confirmação do pagamento.',
    whyCard2Title: 'Pagamento Único',
    whyCard2Body: 'Sem cobranças recorrentes ou mensalidades.',
    whyCard3Title: 'Suporte para Ativação',
    whyCard3Body: 'Atendimento remoto para auxiliar na instalação.',
    whyCard4Title: 'Atendimento Internacional',
    whyCard4Body: 'Português • Español • English',
    bestSellersTitle: 'Mais vendidos',
    viewAll: 'Ver todos',
    categoriesTitle: 'Categorias',
    categoriesSubtitle: 'Encontre rapidamente o que você precisa.',
    categoriesViewAll: 'Ver todas',
    categoryBadge: 'CATEGORIA',
    viewAllInline: 'Ver tudo',
    loadingCategories: 'Carregando categorias...',
    errorCategories: 'Erro ao carregar categorias.',
    loadingProducts: 'Carregando produtos...',
    errorProducts: 'Erro ao carregar produtos.',
    comingSoon: 'Em breve.',
    testimonialsTitle: 'O que nossos clientes dizem',
    testimonialsSubtitle: 'Avaliações reais de quem já comprou conosco',
    howItWorksTitle: 'Como funciona',
    howItWorksSubtitle: 'Um processo simples: escolha, pague e receba sua chave.',
    step1Title: 'Escolha o produto',
    step1Body: 'Veja os detalhes e selecione a opção ideal.',
    step2Title: 'Finalize o pagamento',
    step2Body: 'Pagamento online com confirmação rápida.',
    step3Title: 'Ative com o tutorial',
    step3Body: 'Siga o passo a passo do tutorial do seu produto.',
    helpNeedHelp: 'Precisa de ajuda?',
    helpTitle: 'Conte com suporte especializado',
    helpBody: 'Se tiver qualquer dúvida durante a ativação, nosso suporte pode orientar você.',
    helpCtaBuy: 'Comprar agora',
    helpCtaTutorials: 'Ver tutoriais',
    faqTitle: 'Perguntas frequentes',
    faqSubtitle: 'Tire suas dúvidas antes de comprar.',
    vitrineWindowsSubtitle: 'Licenças digitais para Windows com envio por e-mail.',
    vitrineOfficeSubtitle: 'Pacotes Office e Microsoft 365 para o seu dia a dia.',
    vitrineWindowsServerSubtitle: 'Licenças para servidores e ambientes corporativos.',
    shortcutAntivirus: 'Antivírus',
    shortcutBestSellers: 'Mais vendidos'
  }
})

function pickVitrineItems(predicate: (p: any) => boolean) {
  const fromBest = products.value.filter(predicate)
  return fromBest.slice(0, 4)
}

const vitrineWindows = computed(() => {
  return pickVitrineItems((p: any) => {
    const n = String(p?.nome ?? p?.name ?? '').toLowerCase()
    const s = String(p?.slug ?? '').toLowerCase()
    return n.includes('windows') || s.includes('windows')
  })
})

const vitrineOffice = computed(() => {
  return pickVitrineItems((p: any) => {
    const n = String(p?.nome ?? p?.name ?? '').toLowerCase()
    const s = String(p?.slug ?? '').toLowerCase()
    return n.includes('office') || s.includes('office') || n.includes('microsoft 365') || s.includes('365')
  })
})

const vitrineWindowsServer = computed(() => {
  return pickVitrineItems((p: any) => {
    const n = String(p?.nome ?? p?.name ?? '').toLowerCase()
    const s = String(p?.slug ?? '').toLowerCase()
    return n.includes('server') || s.includes('server')
  })
})

const vitrines = computed(() => {
  const toWindows = categoriasSet.value.has('windows') ? '/categoria/windows' : '/categorias'
  const toOffice = categoriasSet.value.has('office') ? '/categoria/office' : '/categorias'
  const toServer = categoriasSet.value.has('windows-server') ? '/categoria/windows-server' : '/categorias'

  return [
    {
      title: 'Windows',
      subtitle: t.value.vitrineWindowsSubtitle,
      to: toWindows,
      items: vitrineWindows.value
    },
    {
      title: 'Office',
      subtitle: t.value.vitrineOfficeSubtitle,
      to: toOffice,
      items: vitrineOffice.value
    },
    {
      title: 'Windows Server',
      subtitle: t.value.vitrineWindowsServerSubtitle,
      to: toServer,
      items: vitrineWindowsServer.value
    }
  ]
})

const categorias = computed(() => categoriasData.value?.categorias || [])
const categoriasHome = computed(() => categorias.value.slice(0, 12))

const categoriasSet = computed(() => {
  return new Set(categorias.value.map((c) => String(c.slug || '').trim()).filter(Boolean))
})

const categoriasDestaque = computed(() => {
  const items = [
    { label: 'Windows', slug: 'windows' },
    { label: 'Office', slug: 'office' },
    { label: 'Windows Server', slug: 'windows-server' }
  ]

  return items.map((it) => {
    const to = categoriasSet.value.has(it.slug) ? `/categoria/${it.slug}` : '/categorias'
    return { ...it, to }
  })
})

const categoriasHomeFiltered = computed(() => {
  const highlight = new Set(categoriasDestaque.value.map((c) => String(c.slug || '').trim()).filter(Boolean))
  return categoriasHome.value.filter((c: any) => {
    const slug = String(c?.slug || '').trim()
    if (!slug) return false
    return !highlight.has(slug)
  })
})

const categoriasAtalhos = computed(() => {
  const base = [
    { label: 'Windows', slug: 'windows', icon: '🪟' },
    { label: 'Office', slug: 'office', icon: '📄' },
    { label: t.value.shortcutAntivirus, slug: 'antivirus', icon: '🛡️' },
    { label: 'Windows Server', slug: 'windows-server', icon: '🖥️' },
    { label: t.value.shortcutBestSellers, slug: 'mais-vendidos', icon: '🔥' }
  ]

  return base.map((it) => {
    if (it.slug === 'mais-vendidos') return { ...it, to: '/produtos' }
    const to = categoriasSet.value.has(it.slug) ? `/categoria/${it.slug}` : '/categorias'
    return { ...it, to }
  })
})

const faqs = computed(() => {
  if (intl.language.value === 'en') {
    return [
      {
        q: 'How will I receive the product key?',
        a: 'After payment confirmation, you will receive the digital key with instructions by email used in the purchase.'
      },
      {
        q: 'Is delivery immediate?',
        a: 'Yes. In most cases delivery happens within a few minutes after payment confirmation.'
      },
      {
        q: 'Do you provide an activation tutorial?',
        a: 'Yes. Each product has a specific tutorial. You can access it via the “Tutorial” button on the product page.'
      },
      {
        q: 'If I have trouble activating, do you offer support?',
        a: 'Yes. Our support team can guide you during the activation process.'
      }
    ]
  }

  if (intl.language.value === 'es') {
    return [
      {
        q: '¿Cómo recibiré la clave del producto?',
        a: 'Tras la confirmación del pago, recibirás la clave digital con las instrucciones en el e-mail informado en la compra.'
      },
      {
        q: '¿La entrega es inmediata?',
        a: 'Sí. Por lo general la entrega ocurre en pocos minutos después de la confirmación del pago.'
      },
      {
        q: '¿Hay tutorial para activar?',
        a: 'Sí. Cada producto tiene un tutorial específico. Puedes acceder desde el botón “Tutorial” en la página del producto.'
      },
      {
        q: 'Si tengo dificultades con la activación, ¿hay soporte?',
        a: 'Sí. Nuestro soporte puede orientarte durante el proceso de activación.'
      }
    ]
  }

  return [
    {
      q: 'Como vou receber a chave do produto?',
      a: 'Após a confirmação do pagamento, você recebe a chave digital com as instruções no e-mail informado na compra.'
    },
    {
      q: 'A entrega é imediata?',
      a: 'Sim. Em geral a entrega acontece em poucos minutos após a confirmação do pagamento.'
    },
    {
      q: 'Tenho tutorial para ativar?',
      a: 'Sim. Cada produto possui um tutorial específico. Você pode acessar pelo botão “Ver Tutorial” na página do produto.'
    },
    {
      q: 'Se eu tiver dificuldades na ativação, tem suporte?',
      a: 'Sim. Nosso suporte pode orientar você durante o processo de ativação.'
    }
  ]
})

const openFaq = ref<number | null>(0)

const testimonials = computed(() => {
  if (intl.language.value === 'en') {
    return [
      {
        texto: 'I bought Windows 11 Pro and received it in less than 5 minutes! Super easy activation, excellent support. Recommended!',
        nome: 'Marcos Silva',
        tempo: '2 days ago',
        inicial: 'M',
        cor: 'bg-blue-600'
      },
      {
        texto: 'Best price I found! Support helped me with the installation and everything worked out.',
        nome: 'Ana Rodrigues',
        tempo: '1 week ago',
        inicial: 'A',
        cor: 'bg-violet-600'
      },
      {
        texto: 'Third time buying here. Always fast, always reliable. 10/10 support!',
        nome: 'Carlos Mendes',
        tempo: '3 days ago',
        inicial: 'C',
        cor: 'bg-emerald-600'
      }
    ]
  }

  if (intl.language.value === 'es') {
    return [
      {
        texto: 'Compré Windows 11 Pro y lo recibí en menos de 5 minutos. Activación muy simple, soporte excelente. ¡Lo recomiendo!',
        nome: 'Marcos Silva',
        tempo: 'hace 2 días',
        inicial: 'M',
        cor: 'bg-blue-600'
      },
      {
        texto: '¡El mejor precio que encontré! El soporte me ayudó con la instalación y todo salió bien.',
        nome: 'Ana Rodrigues',
        tempo: 'hace 1 semana',
        inicial: 'A',
        cor: 'bg-violet-600'
      },
      {
        texto: 'Tercera vez que compro aquí. Siempre rápido y confiable. ¡Atención de 10!',
        nome: 'Carlos Mendes',
        tempo: 'hace 3 días',
        inicial: 'C',
        cor: 'bg-emerald-600'
      }
    ]
  }

  return [
    {
      texto: 'Comprei o Windows 11 Pro e recebi em menos de 5 minutos! Ativação super simples, suporte excelente. Recomendo!',
      nome: 'Marcos Silva',
      tempo: 'há 2 dias',
      inicial: 'M',
      cor: 'bg-blue-600'
    },
    {
      texto: 'Melhor preço que encontrei! Suporte me ajudou na instalação e deu tudo certo.',
      nome: 'Ana Rodrigues',
      tempo: 'há 1 semana',
      inicial: 'A',
      cor: 'bg-violet-600'
    },
    {
      texto: 'Terceira vez que compro aqui. Sempre rápido, sempre confiável. Atendimento nota 10!',
      nome: 'Carlos Mendes',
      tempo: 'há 3 dias',
      inicial: 'C',
      cor: 'bg-emerald-600'
    }
  ]
})

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx
}
</script>
