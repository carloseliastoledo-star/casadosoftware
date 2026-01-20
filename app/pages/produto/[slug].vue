<template>
  <section class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-6xl mx-auto px-6">

      <!-- Breadcrumb -->
      <div class="text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:underline">Início</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/produtos" class="hover:underline">Produtos</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 font-medium">{{ safeProduct.nome }}</span>
      </div>

      <!-- Título -->
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 text-center">
        {{ safeProduct.nome }}
      </h1>

      <!-- Descrição curta centralizada -->
      <p class="text-gray-600 text-center mt-3 mb-10 max-w-3xl mx-auto">
        {{ safeProduct.descricaoCurta }}
      </p>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-gray-500">
        Carregando produto...
      </div>

      <!-- Erro -->
      <div v-else-if="error || !data" class="text-center py-20 text-red-600">
        Produto não encontrado.
      </div>

      <!-- Card principal -->
      <div
        v-else
        class="bg-white rounded-2xl shadow p-8 grid lg:grid-cols-2 gap-12"
      >

        <!-- Imagem -->
        <div class="flex items-center justify-center">
          <img
            :src="safeProduct.imagem"
            :alt="safeProduct.nome"
            class="max-h-[420px] object-contain"
          />
        </div>

        <!-- Coluna compra -->
        <div class="space-y-5">

          <!-- Avaliações -->
          <div class="flex items-center gap-2 text-yellow-500 text-sm">
            ★★★★★ <span class="text-gray-500">(128 avaliações)</span>
          </div>

          <!-- Preço -->
          <div class="space-y-1">
            <div class="text-sm text-gray-400 line-through">
              R$ 299,90
            </div>

            <div class="text-4xl font-extrabold text-blue-600">
              R$ {{ safeProduct.preco.toFixed(2) }}
            </div>

            <div class="text-sm text-gray-500">
              ou 12x de R$ {{ (safeProduct.preco / 12).toFixed(2) }}
            </div>
          </div>

          <!-- Botões -->
          <div class="space-y-3">
            <button
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-lg transition"
            >
              Comprar agora
            </button>

            <button
              class="w-full border border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Adicionar ao carrinho
            </button>
          </div>

          <!-- Selos -->
          <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>🔒 Compra 100% segura</div>
            <div>⚡ Entrega imediata</div>
            <div>💬 Suporte especializado</div>
            <div>📄 Nota fiscal</div>
          </div>

          <!-- Benefícios -->
          <ul class="mt-4 space-y-2 text-gray-700 text-sm list-disc list-inside">
            <li>Licença original vitalícia</li>
            <li>Ativação online oficial</li>
            <li>Compatível com Windows 10/11</li>
            <li>Entrega automática por e-mail</li>
          </ul>

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
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">
            {{ safeProduct.descricao }}
          </p>
        </section>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(
  () => `/api/products/${slug}`,
  { server: false }
)

/**
 * Produto blindado + descrição longa automática
 */
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

  const descricaoCurta = descricaoBase || ''

  const descricaoLonga = `
${descricaoCurta}

O ${nome} é a solução ideal para quem busca desempenho, segurança e confiabilidade.
Com ativação rápida e compatibilidade total com sistemas atuais, você garante um produto
original, com suporte especializado e entrega imediata.

Nossa licença é vitalícia, sem mensalidades ou renovações, permitindo uso contínuo em seu
computador com total tranquilidade. A ativação é simples e rápida, podendo ser realizada em
poucos minutos após a compra.

Ao adquirir o ${nome}, você recebe:

• Chave de ativação oficial e exclusiva  
• Link direto para download do software  
• Guia completo de instalação passo a passo  
• Suporte técnico especializado em português  

Trabalhamos apenas com licenças originais, garantindo segurança, estabilidade e atualizações
oficiais diretamente do fabricante. Milhares de clientes confiam em nossa plataforma para
aquisição de softwares digitais.

Se você procura uma solução definitiva, segura e com excelente custo-benefício, o ${nome}
é a escolha certa.
`.trim()

  return {
    ...p,
    nome,
    preco,
    imagem: (p as any).image || (p as any).imagem || '/products/placeholder.png',
    slug: slugValue,
    tutorialTitulo: (p as any).tutorialTitle || (p as any).tutorialTitulo || null,
    tutorialSubtitulo: (p as any).tutorialSubtitle || (p as any).tutorialSubtitulo || 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
    descricaoCurta,
    descricao: descricaoLonga
  }
})
</script>
