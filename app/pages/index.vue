<template>
  <section class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-6 pt-12 pb-10">
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100">
            <span class="text-blue-600">⚡</span>
            Entrega imediata por e-mail
          </div>

          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Licenças digitais originais de Windows e Office
          </h1>

          <p class="text-gray-600 text-lg leading-relaxed">
            Compre com segurança e receba sua chave na hora. Suporte especializado e tutorial de ativação para cada produto.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/produtos"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              Ver produtos
            </NuxtLink>

            <NuxtLink
              to="/tutoriais"
              class="border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              Ver tutoriais
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm text-gray-700 pt-2">
            <div class="bg-white border rounded-lg p-3">🔒 Compra segura</div>
            <div class="bg-white border rounded-lg p-3">💳 Pagamento online</div>
            <div class="bg-white border rounded-lg p-3">⚡ Entrega imediata</div>
            <div class="bg-white border rounded-lg p-3">💬 Suporte rápido</div>
          </div>
        </div>

        <div class="relative">
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-lg">
            <div class="text-sm font-semibold text-blue-100">Destaque</div>
            <div class="mt-2 text-2xl font-extrabold">Ative em poucos minutos</div>
            <p class="mt-3 text-blue-100">
              Cada produto possui um tutorial de ativação específico para você seguir passo a passo.
            </p>
            <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div class="bg-white/10 rounded-xl p-4">
                <div class="font-bold">Windows</div>
                <div class="text-blue-100 mt-1">10/11 Pro</div>
              </div>
              <div class="bg-white/10 rounded-xl p-4">
                <div class="font-bold">Office</div>
                <div class="text-blue-100 mt-1">2021 / 365</div>
              </div>
            </div>
            <div class="mt-6">
              <NuxtLink
                to="/produtos"
                class="inline-flex items-center justify-center w-full bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
              >
                Começar agora
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border-y">
      <div class="max-w-7xl mx-auto px-6 py-10">
        <h2 class="text-2xl font-extrabold text-gray-900 text-center">Por que comprar aqui?</h2>
        <p class="text-gray-600 text-center mt-2">
          Uma experiência simples e segura do início ao fim.
        </p>

        <div class="mt-8 grid md:grid-cols-4 gap-5">
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">✅</div>
            <div class="font-bold mt-3">Licenças originais</div>
            <div class="text-sm text-gray-600 mt-1">Chaves digitais com entrega imediata.</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">⚡</div>
            <div class="font-bold mt-3">Entrega rápida</div>
            <div class="text-sm text-gray-600 mt-1">Receba por e-mail após a confirmação.</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">📘</div>
            <div class="font-bold mt-3">Tutoriais por produto</div>
            <div class="text-sm text-gray-600 mt-1">Ativação guiada e fácil de seguir.</div>
          </div>
          <div class="bg-gray-50 border rounded-2xl p-6">
            <div class="text-2xl">💬</div>
            <div class="font-bold mt-3">Suporte especializado</div>
            <div class="text-sm text-gray-600 mt-1">Ajuda rápida quando você precisar.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900">Produtos em destaque</h2>
          <p class="text-gray-600 mt-2">Escolha um produto e finalize a compra em poucos cliques.</p>
        </div>
        <NuxtLink
          to="/produtos"
          class="text-blue-700 font-semibold hover:underline"
        >
          Ver todos →
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-16 text-gray-500">
        Carregando produtos...
      </div>

      <div v-else-if="error" class="text-center py-16 text-red-600">
        Erro ao carregar produtos.
      </div>

      <div v-else class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard
          v-for="product in products"
          :key="product.id + (product.imagem || product.image || '')"
          :product="product"
        />
      </div>
    </div>

    <div class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">Como funciona</h2>
            <p class="text-gray-600 mt-2">
              Um processo simples: escolha, pague e receba sua chave.
            </p>

            <div class="mt-6 space-y-4">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <div class="font-bold text-gray-900">Escolha o produto</div>
                  <div class="text-gray-600 text-sm mt-1">Veja os detalhes e selecione a opção ideal.</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <div class="font-bold text-gray-900">Finalize o pagamento</div>
                  <div class="text-gray-600 text-sm mt-1">Pagamento online com confirmação rápida.</div>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <div class="font-bold text-gray-900">Ative com o tutorial</div>
                  <div class="text-gray-600 text-sm mt-1">Siga o passo a passo do tutorial do seu produto.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <div class="text-blue-700 font-semibold">Precisa de ajuda?</div>
            <div class="text-2xl font-extrabold text-gray-900 mt-2">Conte com suporte especializado</div>
            <p class="text-gray-700 mt-3">
              Se tiver qualquer dúvida durante a ativação, nosso suporte pode orientar você.
            </p>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <NuxtLink
                to="/produtos"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                Comprar agora
              </NuxtLink>
              <NuxtLink
                to="/tutoriais"
                class="border border-blue-600 text-blue-700 hover:bg-white font-semibold px-6 py-3 rounded-lg transition text-center"
              >
                Ver tutoriais
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">Perguntas frequentes</h2>
        <p class="text-gray-600 mt-2">Tire suas dúvidas antes de comprar.</p>
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
definePageMeta({ ssr: false })

const { data, pending, error } = await useFetch('/api/products', {
  server: false
})

const products = computed(() => data.value || [])

const faqs = [
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
] as const

const openFaq = ref<number | null>(0)

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx
}
</script>
