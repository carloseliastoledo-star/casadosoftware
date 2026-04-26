<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<template>
  <div class="min-h-screen bg-black text-white">

    <!-- HERO -->
    <section class="px-4 py-16 md:py-24 text-center">
      <div class="max-w-3xl mx-auto">

        <h1 class="text-3xl md:text-5xl font-bold mb-6 leading-tight">
          Ferramentas completas para trabalho e estudo em um só acesso
        </h1>

        <p class="text-lg text-gray-300 mb-8">
          Crie documentos, planilhas e apresentações com facilidade usando uma interface conhecida.
        </p>

        <div class="space-y-2 mb-8 text-left max-w-md mx-auto">
          <div class="flex items-center gap-2">
            <span class="text-green-500 font-bold">✔</span>
            <span>Compatível com PC, Mac e celular</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-500 font-bold">✔</span>
            <span>Acesso rápido após ativação</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-500 font-bold">✔</span>
            <span>Ideal para trabalho e estudos</span>
          </div>
        </div>

        <div class="text-3xl font-bold mb-4">
          R$ 99,00
        </div>

        <a href="/checkout" class="inline-block bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-lg text-lg">
          Garantir acesso agora
        </a>

        <p class="text-sm text-gray-400 mt-4">
          Pagamento único • Acesso imediato
        </p>

      </div>
    </section>

    <!-- BENEFÍCIOS -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-5xl mx-auto text-center">

        <h2 class="text-2xl md:text-3xl font-bold mb-12">
          Tudo que você precisa para produtividade
        </h2>

        <div class="grid md:grid-cols-3 gap-8">

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <div class="text-3xl mb-4">📄</div>
            <h3 class="font-semibold mb-2">Documentos profissionais</h3>
            <p class="text-gray-300 text-sm">
              Crie textos organizados com aparência profissional.
            </p>
          </div>

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <div class="text-3xl mb-4">📊</div>
            <h3 class="font-semibold mb-2">Planilhas completas</h3>
            <p class="text-gray-300 text-sm">
              Organize dados e faça cálculos com facilidade.
            </p>
          </div>

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <div class="text-3xl mb-4">📽️</div>
            <h3 class="font-semibold mb-2">Apresentações claras</h3>
            <p class="text-gray-300 text-sm">
              Monte slides rápidos e eficientes.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section class="px-4 py-16">
      <div class="max-w-4xl mx-auto text-center">

        <h2 class="text-2xl md:text-3xl font-bold mb-12">
          Como funciona
        </h2>

        <div class="grid md:grid-cols-3 gap-8">

          <div>
            <div class="bg-green-500 text-black w-12 h-12 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
              1
            </div>
            <p>Escolha o acesso</p>
          </div>

          <div>
            <div class="bg-green-500 text-black w-12 h-12 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
              2
            </div>
            <p>Finalize o pagamento</p>
          </div>

          <div>
            <div class="bg-green-500 text-black w-12 h-12 rounded-full flex items-center justify-center font-bold mx-auto mb-4">
              3
            </div>
            <p>Receba e comece a usar</p>
          </div>

        </div>

      </div>
    </section>

    <!-- PROVA SOCIAL -->
    <section class="px-4 py-16 bg-white/5">
      <div class="max-w-5xl mx-auto text-center">

        <h2 class="text-2xl md:text-3xl font-bold mb-12">
          O que dizem os usuários
        </h2>

        <div class="grid md:grid-cols-3 gap-6">

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <p class="text-gray-300 text-sm mb-4">
              “Resolvi tudo do meu trabalho com isso. Muito prático.”
            </p>
            <p class="text-gray-400 text-xs">Cliente verificado</p>
          </div>

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <p class="text-gray-300 text-sm mb-4">
              “Funcionou rápido e é muito fácil de usar.”
            </p>
            <p class="text-gray-400 text-xs">Usuário</p>
          </div>

          <div class="bg-white/5 p-6 rounded-xl border border-white/10">
            <p class="text-gray-300 text-sm mb-4">
              “Uso todos os dias para estudar e trabalhar.”
            </p>
            <p class="text-gray-400 text-xs">Aluno</p>
          </div>

        </div>

      </div>
    </section>

    <!-- GARANTIA -->
    <section class="px-4 py-16">
      <div class="max-w-3xl mx-auto text-center">

        <h2 class="text-2xl font-bold mb-6">
          Compra segura
        </h2>

        <div class="space-y-3 text-gray-300">
          <p>✔ Garantia de 7 dias</p>
          <p>✔ Suporte disponível</p>
          <p>✔ Processo simples e rápido</p>
        </div>

      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="px-4 py-16 bg-green-500 text-center">

      <h2 class="text-2xl md:text-3xl font-bold text-black mb-6">
        Acesso completo por R$ 99,00
      </h2>

      <a href="/checkout" class="inline-block bg-black text-white px-8 py-4 rounded-lg font-bold text-lg">
        Ativar acesso agora
      </a>

    </section>

    <!-- RODAPÉ BLINDADO -->
    <footer class="px-4 py-8 text-gray-400 text-xs text-center">

      <p>
        Este site oferece acesso a soluções digitais para produtividade.
      </p>

      <p class="mt-2">
        Não possuímos vínculo institucional com marcas terceiras.
      </p>

      <p class="mt-2">
        O uso das ferramentas está sujeito aos termos da plataforma.
      </p>

    </footer>

  </div>
</template>