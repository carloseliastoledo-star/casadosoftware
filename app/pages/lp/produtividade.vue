<template>
  <div class="min-h-screen bg-black text-white">
    <!-- HERO -->
    <section class="px-4 py-16 md:py-24">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          Solução Completa de Produtividade para Trabalho e Estudo
        </h1>
        <p class="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Acesse ferramentas essenciais para criar documentos, planilhas e apresentações com facilidade.
        </p>
        
        <div class="flex flex-col items-center gap-3 mb-8 text-left max-w-md mx-auto">
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-600 font-bold">✔</span>
            <span>Interface simples e conhecida</span>
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-600 font-bold">✔</span>
            <span>Compatível com múltiplos dispositivos</span>
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-600 font-bold">✔</span>
            <span>Acesso rápido após ativação</span>
          </div>
        </div>

        <NuxtLink
          to="/checkout"
          class="inline-block bg-green-500 hover:bg-green-400 text-black font-extrabold px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Continuar para acesso
        </NuxtLink>

        <p class="text-sm text-gray-400 mt-4">
          Acesso digital • Suporte disponível
        </p>
      </div>
    </section>

    <!-- BENEFÍCIOS -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-white mb-12">
          Ferramentas para sua rotina
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="text-3xl mb-4">📄</div>
            <h3 class="font-semibold text-lg text-white mb-2">Documentos profissionais</h3>
            <p class="text-gray-300 text-sm">Crie e edite textos com formatação profissional.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="text-3xl mb-4">📊</div>
            <h3 class="font-semibold text-lg text-white mb-2">Planilhas organizadas</h3>
            <p class="text-gray-300 text-sm">Organize dados e crie cálculos com facilidade.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="text-3xl mb-4">📽️</div>
            <h3 class="font-semibold text-lg text-white mb-2">Apresentações eficientes</h3>
            <p class="text-gray-300 text-sm">Monte slides claros e profissionais.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PROVA SOCIAL -->
    <section class="px-4 py-16">
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-xl text-gray-300 font-medium">
          Mais de 2.000 usuários já utilizam essa solução no dia a dia
        </p>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-white mb-12">
          Como funciona
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-green-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
            <h3 class="font-semibold text-white mb-2">Escolha o acesso</h3>
            <p class="text-gray-300 text-sm">Selecione a opção que melhor se adapta à sua necessidade.</p>
          </div>
          <div class="text-center">
            <div class="bg-green-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
            <h3 class="font-semibold text-white mb-2">Finalize o pagamento</h3>
            <p class="text-gray-300 text-sm">Complete o processo de forma segura e rápida.</p>
          </div>
          <div class="text-center">
            <div class="bg-green-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
            <h3 class="font-semibold text-white mb-2">Receba e utilize</h3>
            <p class="text-gray-300 text-sm">Acesse as ferramentas e comece a usar imediatamente.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BLOCO DE CONFIANÇA -->
    <section class="px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10 text-center">
            <div class="text-3xl mb-3">🛡️</div>
            <h3 class="font-semibold text-white mb-2">Garantia de 7 dias</h3>
            <p class="text-gray-300 text-sm">Período de garantia para sua segurança.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10 text-center">
            <div class="text-3xl mb-3">💬</div>
            <h3 class="font-semibold text-white mb-2">Suporte disponível</h3>
            <p class="text-gray-300 text-sm">Equipe pronta para ajudar quando precisar.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10 text-center">
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="font-semibold text-white mb-2">Processo simples</h3>
            <p class="text-gray-300 text-sm">Fluxo direto sem complicações.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA INTERMEDIÁRIO -->
    <section class="px-4 py-12 bg-green-500">
      <div class="max-w-2xl mx-auto text-center">
        <NuxtLink
          to="/checkout"
          class="inline-block bg-black hover:bg-gray-900 text-white font-extrabold px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Continuar para acesso
        </NuxtLink>
      </div>
    </section>

    <!-- SEÇÃO DE VALOR -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-6">
          Valor atual para acesso
        </h2>
        <div class="text-5xl md:text-6xl font-bold text-white mb-4">
          R$ 99,00
        </div>
        <p class="text-gray-300 text-sm mb-8">
          Pagamento único • Acesso imediato
        </p>
        <NuxtLink
          to="/checkout"
          class="inline-block bg-green-500 hover:bg-green-400 text-black font-extrabold px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Continuar para acesso
        </NuxtLink>
      </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section class="px-4 py-16">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-white mb-12">
          O que dizem os usuários
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="flex items-center gap-1 mb-3">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-gray-300 text-sm mb-4">"Solução prática para meu trabalho. Consigo criar documentos e planilhas sem dificuldade."</p>
            <p class="text-gray-400 text-xs font-medium">Carlos M.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="flex items-center gap-1 mb-3">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-gray-300 text-sm mb-4">"Interface familiar e fácil de usar. Ativação foi rápida e o suporte ajudou quando precisei."</p>
            <p class="text-gray-400 text-xs font-medium">Ana S.</p>
          </div>
          <div class="bg-white/5 rounded-xl p-6 shadow-sm border border-white/10">
            <div class="flex items-center gap-1 mb-3">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-gray-300 text-sm mb-4">"Boa solução para estudantes. Consigo fazer trabalhos e apresentações com qualidade."</p>
            <p class="text-gray-400 text-xs font-medium">Ricardo L.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-center text-white mb-12">
          Perguntas frequentes
        </h2>
        <div class="space-y-4">
          <div class="bg-white/5 rounded-lg p-5 border border-white/10">
            <h3 class="font-semibold text-white mb-2">Como recebo o acesso?</h3>
            <p class="text-gray-300 text-sm">Após a confirmação do pagamento, você recebe as instruções de acesso por e-mail em poucos minutos.</p>
          </div>
          <div class="bg-white/5 rounded-lg p-5 border border-white/10">
            <h3 class="font-semibold text-white mb-2">Funciona em computador?</h3>
            <p class="text-gray-300 text-sm">Sim, a solução é compatível com computadores desktop e notebooks.</p>
          </div>
          <div class="bg-white/5 rounded-lg p-5 border border-white/10">
            <h3 class="font-semibold text-white mb-2">Preciso pagar mensalidade?</h3>
            <p class="text-gray-300 text-sm">Não, o acesso é com pagamento único. Não há cobranças recorrentes.</p>
          </div>
          <div class="bg-white/5 rounded-lg p-5 border border-white/10">
            <h3 class="font-semibold text-white mb-2">Tem suporte?</h3>
            <p class="text-gray-300 text-sm">Sim, oferecemos suporte para ajudar com dúvidas sobre ativação e uso das ferramentas.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="px-4 py-16">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-6">
          Pronto para começar?
        </h2>
        <p class="text-gray-300 mb-8">
          Acesse ferramentas essenciais para sua produtividade.
        </p>
        <NuxtLink
          to="/checkout"
          class="inline-block bg-green-500 hover:bg-green-400 text-black font-extrabold px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Continuar para acesso
        </NuxtLink>
      </div>
    </section>

    <!-- BLOCO LEGAL CRÍTICO -->
    <section class="px-4 py-8 bg-white/5 border-t border-white/10">
      <div class="max-w-4xl mx-auto">
        <p class="text-xs text-gray-400 text-center leading-relaxed">
          Este site oferece acesso a soluções digitais para produtividade e suporte ao usuário. Não possuímos vínculo institucional com marcas terceiras. O uso das ferramentas está sujeito aos termos da plataforma.
        </p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="px-4 py-8 bg-black text-gray-400">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 text-sm">
          <NuxtLink to="/politica-de-privacidade" class="hover:text-white transition-colors">
            Política de Privacidade
          </NuxtLink>
          <NuxtLink to="/termos-de-uso" class="hover:text-white transition-colors">
            Termos de Uso
          </NuxtLink>
          <NuxtLink to="/contato" class="hover:text-white transition-colors">
            Contato
          </NuxtLink>
        </div>
        <p class="text-center text-xs mt-6 text-gray-400">
          © {{ new Date().getFullYear() }} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp', ssr: false })

const { siteName } = useSiteBranding()
const baseUrl = useSiteUrl()

useSeoMeta({
  title: 'Solução de Produtividade para Trabalho e Estudo',
  description: 'Acesse ferramentas essenciais para criar documentos, planilhas e apresentações com facilidade. Interface simples e compatível com múltiplos dispositivos.'
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/lp/produtividade` }] : []
}))
</script>
