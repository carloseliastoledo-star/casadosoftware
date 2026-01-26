<template>
  <section class="bg-gray-50">
    <div class="bg-gradient-to-br from-[#0b2b6a] via-[#203a7a] to-[#2f4fb4]">
      <div class="max-w-7xl mx-auto px-6 pt-10 pb-14">
        <div class="flex flex-col items-center text-center">
          <div class="text-xs font-semibold tracking-wide text-white/80 border border-white/15 bg-white/10 px-4 py-2 rounded-full">
            + Milhares de clientes satisfeitos
          </div>

          <h1 class="mt-8 text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Licenças Digitais
            <span class="block mt-3">
              <span class="text-cyan-300">Originais</span>
              <span class="text-white"> e </span>
              <span class="text-indigo-300">Instantâneas</span>
            </span>
          </h1>

          <p class="mt-6 max-w-2xl text-white/80 text-base md:text-lg leading-relaxed">
            Compre Windows, Office, Autodesk e mais com entrega imediata por e-mail e suporte
          </p>

          <div class="mt-8 flex flex-col sm:flex-row gap-4">
            <NuxtLink
              to="/produtos"
              class="bg-cyan-400 hover:bg-cyan-300 text-[#0b2b6a] font-bold px-8 py-3 rounded-xl transition text-center"
            >
              Ver Produtos
            </NuxtLink>
            <NuxtLink
              to="/tutoriais"
              class="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition text-center"
            >
              Como Ativar
            </NuxtLink>
          </div>

          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/85">
            <div class="flex items-center gap-2">
              <span class="text-green-300">✔</span>
              Entrega em 5 minutos
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-300">✔</span>
              100% Original
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-300">✔</span>
              Suporte Gratuito
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
            <div class="font-bold mt-3">Empresa registrada no Microsoft Partner Network</div>
            <div class="text-sm text-gray-600 mt-1">Chaves digitais com entrega imediata.</div>
            <a
              href="https://appsource.microsoft.com/en-us/marketplace/partner-dir/6f443328-4eb9-4548-9928-f302947f80a5/overview"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              Ver parceiro
            </a>
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

    <div class="bg-gray-50 border-b">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">Categorias</h2>
            <p class="text-gray-600 mt-2">Encontre rapidamente o que você precisa.</p>
          </div>
          <NuxtLink
            to="/categorias"
            class="text-blue-700 font-semibold hover:underline"
          >
            Ver todas →
          </NuxtLink>
        </div>

        <div v-if="categoriasPending" class="text-center py-12 text-gray-500">
          Carregando categorias...
        </div>

        <div v-else-if="categoriasError" class="text-center py-12 text-red-600">
          Erro ao carregar categorias.
        </div>

        <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="c in categoriasHome"
            :key="c.id"
            :to="`/categoria/${c.slug}`"
            class="bg-white border rounded-2xl p-5 hover:shadow-sm transition"
          >
            <div class="font-bold text-gray-900">{{ c.nome }}</div>
            <div class="text-xs text-gray-500 mt-1">/categoria/{{ c.slug }}/</div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900">Mais vendidos</h2>
          <p class="text-gray-600 mt-2">Os produtos que mais vendem na loja.</p>
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
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">O que nossos clientes dizem</h2>
          <p class="text-gray-600 mt-2">Avaliações reais de quem já comprou conosco</p>
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
definePageMeta({ ssr: true })

useHead(() => ({
  link: [{ rel: 'canonical', href: 'https://casadosoftware.com.br/' }]
}))

const { data, pending, error } = await useFetch('/api/products/best-sellers', {
  server: true
})

type CategoriaDto = { id: string; nome: string; slug: string }

const { data: categoriasData, pending: categoriasPending, error: categoriasError } = await useFetch<{ ok: true; categorias: CategoriaDto[] }>('/api/categorias', {
  server: true
})

const products = computed(() => data.value || [])

const categorias = computed(() => categoriasData.value?.categorias || [])
const categoriasHome = computed(() => categorias.value.slice(0, 8))

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

const testimonials = [
  {
    texto: 'Comprei o Windows 11 Pro e recebi em menos de 5 minutos! Ativação super simples, suporte excelente. Recomendo!',
    nome: 'Marcos Silva',
    tempo: 'há 2 dias',
    inicial: 'M',
    cor: 'bg-blue-600'
  },
  {
    texto: 'Melhor preço que encontrei! Office 365 original, suporte me ajudou na instalação. Produto 100% genuíno.',
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
] as const

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx
}
</script>
