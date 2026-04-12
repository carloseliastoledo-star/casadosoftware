<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'Pacote Completo de Produtividade para PC | Casa do Software',
  meta: [
    { name: 'description', content: 'Ferramentas completas para documentos, planilhas e apresentações com acesso imediato, instalação rápida e suporte.' },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: 'Pacote Completo de Produtividade para PC | Casa do Software' },
    { property: 'og:description', content: 'Ferramentas completas para documentos, planilhas e apresentações com acesso imediato, instalação rápida e suporte.' },
  ]
})

const faqOpen = ref<number | null>(null)

const faqs = [
  {
    q: 'Como recebo o acesso?',
    a: 'Após a confirmação do pagamento, você recebe as instruções de acesso diretamente no e-mail informado no checkout.'
  },
  {
    q: 'Em quanto tempo fica disponível?',
    a: 'O acesso é liberado de forma rápida após a compra. Na maioria dos casos, em poucos minutos.'
  },
  {
    q: 'Funciona em computador?',
    a: 'Sim. O pacote é compatível com PCs e notebooks com Windows. Instalação simples e direta.'
  },
  {
    q: 'Tem suporte se eu precisar?',
    a: 'Sim. Nossa equipe está disponível para ajudar em caso de dúvida na instalação ou ativação.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f] text-white font-sans antialiased">

    <!-- Urgency bar -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-semibold tracking-wide">
      🔥 Oferta especial ativa — acesso imediato após a compra
    </div>

    <main class="w-full max-w-5xl mx-auto px-4 sm:px-6">

      <!-- ───────────────────────── HERO ───────────────────────── -->
      <section class="pt-16 pb-20 text-center">
        <span class="inline-block bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          ⚡ Acesso Imediato
        </span>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6 text-white">
          Pacote Completo de<br class="hidden sm:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Produtividade para PC</span>
        </h1>

        <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Documentos, planilhas e apresentações em um único lugar com instalação rápida e uso simples.
        </p>

        <ul class="flex flex-col sm:flex-row gap-3 justify-center mb-10 text-sm text-gray-300">
          <li class="flex items-center gap-2 justify-center">
            <span class="text-emerald-400 font-bold">✓</span> Acesso imediato após a compra
          </li>
          <li class="flex items-center gap-2 justify-center">
            <span class="text-emerald-400 font-bold">✓</span> Compatível com PC e notebook
          </li>
          <li class="flex items-center gap-2 justify-center">
            <span class="text-emerald-400 font-bold">✓</span> Ideal para trabalho, estudo e uso diário
          </li>
        </ul>

        <NuxtLink
          to="/checkout"
          class="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 hover:shadow-emerald-500/50"
        >
          🚀 Liberar Acesso Agora
        </NuxtLink>

        <p class="mt-4 text-xs text-gray-500">Pagamento único • Liberação rápida • Suporte disponível</p>

        <!-- Social proof micro -->
        <div class="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
          <div class="flex -space-x-2">
            <div v-for="i in 5" :key="i" class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold">{{ String.fromCharCode(64 + i) }}</div>
          </div>
          <span><strong class="text-white">+2.400 clientes</strong> já adquiriram</span>
        </div>
      </section>

      <!-- ───────────────────────── BENEFÍCIOS ───────────────────────── -->
      <section class="py-16 border-t border-white/5">
        <h2 class="text-2xl sm:text-3xl font-black text-center mb-12 text-white">
          Tudo o que você precisa para <span class="text-emerald-400">produzir mais</span>
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            v-for="item in [
              { icon: '📄', title: 'Documentos profissionais', desc: 'Crie, edite e formate com facilidade' },
              { icon: '📊', title: 'Planilhas completas', desc: 'Organize dados com eficiência' },
              { icon: '📽️', title: 'Apresentações modernas', desc: 'Slides com visual profissional' },
              { icon: '⚡', title: 'Instalação rápida', desc: 'Configuração simples em minutos' },
              { icon: '🎯', title: 'Uso simples', desc: 'Interface intuitiva para todos' },
              { icon: '💰', title: 'Custo-benefício', desc: 'Pagamento único, sem mensalidade' },
            ]"
            :key="item.title"
            class="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-200"
          >
            <div class="text-3xl mb-3">{{ item.icon }}</div>
            <div class="font-bold text-sm sm:text-base text-white mb-1">{{ item.title }}</div>
            <div class="text-xs text-gray-400 leading-relaxed">{{ item.desc }}</div>
          </div>
        </div>
      </section>

      <!-- ───────────────────────── PROVA SOCIAL ───────────────────────── -->
      <section class="py-16 border-t border-white/5">
        <h2 class="text-2xl sm:text-3xl font-black text-center mb-12 text-white">
          Quem compra, <span class="text-emerald-400">recomenda</span>
        </h2>

        <div class="grid sm:grid-cols-3 gap-5">
          <div
            v-for="(review, i) in [
              { name: 'Lucas M.', city: 'São Paulo, SP', text: 'Recebi o acesso rápido e consegui instalar sem dificuldade. Muito prático.' },
              { name: 'Ana C.', city: 'Belo Horizonte, MG', text: 'Usei no trabalho no mesmo dia. Valeu muito a pena.' },
              { name: 'Rafael S.', city: 'Curitiba, PR', text: 'Boa experiência, entrega rápida e tudo funcionando certo.' },
            ]"
            :key="i"
            class="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div class="flex text-yellow-400 text-sm mb-3">★★★★★</div>
            <p class="text-gray-300 text-sm leading-relaxed mb-4">"{{ review.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-black text-white">
                {{ review.name.charAt(0) }}
              </div>
              <div>
                <div class="text-sm font-bold text-white">{{ review.name }}</div>
                <div class="text-xs text-gray-500">{{ review.city }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────────────────────── OFERTA ───────────────────────── -->
      <section class="py-16 border-t border-white/5">
        <div class="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto">
          <span class="inline-block bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            ⏳ Oferta por tempo limitado
          </span>

          <h2 class="text-2xl sm:text-3xl font-black text-white mb-2">Oferta disponível por tempo limitado</h2>
          <p class="text-gray-400 text-sm mb-6">Pagamento único, sem cobranças recorrentes.</p>

          <div class="mb-2 text-gray-500 text-sm line-through">De R$ 89,90</div>
          <div class="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1">
            R$ 49,90
          </div>
          <div class="text-gray-400 text-sm mb-8">pagamento único</div>

          <NuxtLink
            to="/checkout"
            class="block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105"
          >
            🛒 Comprar Agora
          </NuxtLink>

          <p class="mt-4 text-xs text-gray-500">🔒 Pagamento seguro • Acesso rápido</p>
        </div>
      </section>

      <!-- ───────────────────────── GARANTIA ───────────────────────── -->
      <section class="py-16 border-t border-white/5">
        <div class="flex flex-col sm:flex-row items-center gap-8 max-w-2xl mx-auto text-center sm:text-left">
          <div class="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/40 flex flex-col items-center justify-center">
            <div class="text-3xl">🛡️</div>
            <div class="text-xs font-black text-emerald-400 mt-0.5">7 DIAS</div>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-white mb-2">Compra com mais segurança</h2>
            <p class="text-gray-400 text-base leading-relaxed">
              Você conta com garantia de 7 dias para testar com tranquilidade. Se não ficar satisfeito, pode solicitar o reembolso.
            </p>
          </div>
        </div>
      </section>

      <!-- ───────────────────────── FAQ ───────────────────────── -->
      <section class="py-16 border-t border-white/5">
        <h2 class="text-2xl sm:text-3xl font-black text-center mb-10 text-white">
          Perguntas <span class="text-emerald-400">frequentes</span>
        </h2>

        <div class="max-w-2xl mx-auto space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-sm sm:text-base text-white hover:bg-white/5 transition-colors"
              @click="faqOpen = faqOpen === i ? null : i"
            >
              <span>{{ faq.q }}</span>
              <span class="flex-shrink-0 text-emerald-400 text-xl leading-none transition-transform duration-200" :class="{ 'rotate-45': faqOpen === i }">+</span>
            </button>
            <div
              v-if="faqOpen === i"
              class="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </section>

      <!-- ───────────────────────── CTA FINAL ───────────────────────── -->
      <section class="py-16 border-t border-white/5 text-center">
        <h2 class="text-3xl sm:text-4xl font-black text-white mb-4">
          Pronto para começar?
        </h2>
        <p class="text-gray-400 mb-8">Acesso imediato • Suporte disponível • 7 dias de garantia</p>
        <NuxtLink
          to="/checkout"
          class="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105"
        >
          🚀 Liberar Acesso Agora
        </NuxtLink>
      </section>

      <!-- ───────────────────────── AVISO INSTITUCIONAL ───────────────────────── -->
      <footer class="border-t border-white/5 py-8 text-center">
        <p class="text-xs text-gray-600 max-w-xl mx-auto leading-relaxed">
          Este site oferece acesso a ferramentas digitais de produtividade e suporte relacionado ao uso. Não possuímos vínculo institucional com marcas terceiras.
        </p>
        <p class="text-xs text-gray-700 mt-2">© {{ new Date().getFullYear() }} Casa do Software. Todos os direitos reservados.</p>
      </footer>

    </main>
  </div>
</template>
