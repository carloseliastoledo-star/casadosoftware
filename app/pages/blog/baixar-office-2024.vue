<template>
  <section class="bg-gray-50 min-h-screen py-10 md:py-14">
    <div class="max-w-6xl mx-auto px-6">
      <article class="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="p-6 md:p-8 lg:p-10">
          <!-- Breadcrumb -->
          <nav class="text-xs text-gray-500 mb-5">
            <NuxtLink :to="`${langPrefix}/`" class="hover:text-blue-700 transition">Home</NuxtLink>
            <span class="mx-2">/</span>
            <NuxtLink :to="`${langPrefix}/blog`" class="hover:text-blue-700 transition">Blog</NuxtLink>
            <span class="mx-2">/</span>
            <span class="text-gray-700 font-medium">Office 2024: Guia Completo Download, Instalação e Ativação</span>
          </nav>

          <!-- Header -->
          <header class="max-w-4xl">
            <p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Guia Completo 2025</p>
            <h1 class="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Office 2024: Download, Instalação e Ativação Oficial
            </h1>
            <p class="mt-4 text-lg text-gray-600 leading-relaxed">
              Guia completo para baixar, instalar e ativar o Microsoft Office 2024. Versão oficial, segura e com licença permanente. Resolva erros comuns e escolha a melhor versão para você.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span>Atualizado em {{ formatDate(new Date().toISOString()) }}</span>
              <span>15 min de leitura</span>
            </div>
          </header>

          <!-- Aviso Anti-Pirataria -->
          <div class="mt-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5">
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <h2 class="font-semibold text-amber-900">Aviso Importante sobre Segurança</h2>
                <p class="text-amber-800 text-sm mt-1">
                  Este guia <strong>não fornece ativadores, cracks, torrents ou arquivos modificados</strong>. O objetivo é orientar o download seguro do Office 2024 e a instalação com <strong>licença válida e original</strong>.
                </p>
              </div>
            </div>
          </div>

          <!-- CTA Principal - Instalação Segura -->
          <div id="cta-inicio" class="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 md:p-8 text-white">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 class="text-xl md:text-2xl font-bold">Instale o Office 2024 com Segurança</h2>
                <p class="mt-2 text-blue-100">Evite ativadores, cracks e torrents. Receba sua licença digital por e-mail com instruções de instalação e suporte especializado.</p>
              </div>
              <NuxtLink
                to="/produto/office-ltsc-pro-plus-2024"
                class="shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
                data-cta="office-2024-hero"
              >
                Comprar Office 2024 →
              </NuxtLink>
            </div>
          </div>

          <!-- Índice -->
          <div class="mt-8 bg-blue-50 rounded-xl p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Índice do Guia</h2>
            <ul class="grid md:grid-cols-2 gap-3">
              <li><a href="#o-que-e" class="text-blue-700 hover:underline">01. O que é o Office 2024</a></li>
              <li><a href="#download" class="text-blue-700 hover:underline">02. Como Baixar o Office 2024</a></li>
              <li><a href="#instalacao" class="text-blue-700 hover:underline">03. Instalação Passo a Passo</a></li>
              <li><a href="#ativacao" class="text-blue-700 hover:underline">04. Ativação Oficial</a></li>
              <li><a href="#erros" class="text-blue-700 hover:underline">05. Erros Comuns e Soluções</a></li>
              <li><a href="#comparacao" class="text-blue-700 hover:underline">06. Office 2024 vs 2021 vs 365</a></li>
              <li><a href="#riscos" class="text-blue-700 hover:underline font-semibold text-red-600">07. Riscos de Ativadores e Cracks</a></li>
              <li><a href="#faq" class="text-blue-700 hover:underline">08. Perguntas Frequentes</a></li>
              <li><a href="#oferta" class="text-blue-700 hover:underline font-semibold">09. Onde Comprar com Segurança</a></li>
            </ul>
          </div>

          <!-- Bloco Comparativo: Riscos vs Segurança -->
          <section id="riscos" class="mt-8">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Ativador, Torrent, Crack ou Licença Original?</h2>
            <p class="text-gray-700 mb-6">
              Muitos usuários buscam alternativas "grátis" para obter o Office 2024. Saiba os riscos de cada método e por que a <strong>licença digital original</strong> é o investimento mais seguro:
            </p>

            <div class="grid md:grid-cols-2 gap-4">
              <!-- Riscos -->
              <div class="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Métodos Inseguros
                </h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-red-400 pl-4">
                    <h4 class="font-semibold text-red-900">Ativador Office 2024</h4>
                    <ul class="text-sm text-red-700 mt-1 space-y-1">
                      <li>• Risco de malware e vírus</li>
                      <li>• Ativação pode falhar a qualquer momento</li>
                      <li>• Sem acesso a atualizações de segurança</li>
                      <li>• Violação dos termos de uso da Microsoft</li>
                    </ul>
                  </div>
                  <div class="border-l-4 border-red-400 pl-4">
                    <h4 class="font-semibold text-red-900">Torrent Office 2024</h4>
                    <ul class="text-sm text-red-700 mt-1 space-y-1">
                      <li>• Arquivos adulterados com backdoors</li>
                      <li>• Exposição a ransomware</li>
                      <li>• Dados pessoais em risco</li>
                      <li>• Sem suporte técnico</li>
                    </ul>
                  </div>
                  <div class="border-l-4 border-red-400 pl-4">
                    <h4 class="font-semibold text-red-900">Crack Office 2024</h4>
                    <ul class="text-sm text-red-700 mt-1 space-y-1">
                      <li>• Instabilidade do sistema</li>
                      <li>• Corrupção de arquivos</li>
                      <li>• Incompatibilidade com atualizações</li>
                      <li>• Consequências legais</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Alternativa Segura -->
              <div class="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <span>✅</span> Alternativa Segura
                </h3>
                <div class="space-y-4">
                  <div class="border-l-4 border-green-500 pl-4">
                    <h4 class="font-semibold text-green-900">Licença Digital Original</h4>
                    <ul class="text-sm text-green-700 mt-1 space-y-1">
                      <li>• Download oficial da Microsoft</li>
                      <li>• Ativação garantida e permanente</li>
                      <li>• Atualizações de segurança inclusas</li>
                      <li>• 100% dentro da lei</li>
                    </ul>
                  </div>
                  <div class="bg-white rounded-lg p-4 mt-4">
                    <h5 class="font-semibold text-gray-900 mb-2">Inclui na Casa do Software:</h5>
                    <ul class="text-sm text-gray-700 space-y-1">
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Chave de ativação original</li>
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Link de download oficial</li>
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Tutorial de instalação</li>
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Suporte técnico especializado</li>
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Entrega imediata por e-mail</li>
                      <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Garantia de ativação</li>
                    </ul>
                  </div>
                  <NuxtLink
                    to="/produto/office-ltsc-pro-plus-2024"
                    class="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition"
                    data-cta="riscos-vs-seguranca"
                  >
                    Quero Office 2024 Original →
                  </NuxtLink>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <p class="text-gray-600 text-sm">
                Leia mais sobre cada risco: 
                <NuxtLink to="/blog/office-2024-ativador-riscos" class="text-blue-600 hover:underline">Ativadores</NuxtLink>, 
                <NuxtLink to="/blog/office-2024-torrent-riscos" class="text-blue-600 hover:underline">Torrents</NuxtLink>, 
                <NuxtLink to="/blog/office-2024-crack-riscos" class="text-blue-600 hover:underline">Cracks</NuxtLink>
              </p>
            </div>
          </section>

          <!-- CTA Meio do Artigo -->
          <div id="cta-meio" class="my-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 class="text-xl md:text-2xl font-bold">Não arrisque seu computador</h2>
                <p class="mt-2 text-indigo-100">Ativadores e cracks podem instalar malwares invisíveis. Proteja seus dados com uma licença 100% original.</p>
              </div>
              <NuxtLink
                to="/produto/office-ltsc-pro-plus-2024"
                class="shrink-0 bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
                data-cta="office-2024-meio"
              >
                Comprar Agora →
              </NuxtLink>
            </div>
          </div>

          <!-- Conteúdo Principal -->
          <div class="mt-8 blog-content space-y-10">

            <!-- Seção 1 -->
            <section id="o-que-e">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">O que é o Microsoft Office 2024?</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                O <strong>Microsoft Office 2024</strong> é a versão mais recente da suite de produtividade da Microsoft, lançada em outubro de 2024. É uma versão <strong>perpétua</strong> (licença única), diferente do Office 365 que requer assinatura mensal.
              </p>
              <div class="bg-gray-50 rounded-xl p-6 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Novidades do Office 2024</h3>
                <ul class="space-y-2 text-gray-700">
                  <li class="flex items-start gap-2"><span class="text-green-500">✓</span><span><strong>Copilot integrado</strong> - Assistente de IA para criar e editar documentos</span></li>
                  <li class="flex items-start gap-2"><span class="text-green-500">✓</span><span><strong>Excel</strong> - Novas funções de análise de dados e visualização</span></li>
                  <li class="flex items-start gap-2"><span class="text-green-500">✓</span><span><strong>PowerPoint</strong> - Apresentações com design automático por IA</span></li>
                  <li class="flex items-start gap-2"><span class="text-green-500">✓</span><span><strong>Performance</strong> - Inicialização 20% mais rápida que o Office 2021</span></li>
                </ul>
              </div>
            </section>

            <!-- Seção 2 -->
            <section id="download">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Como Baixar o Office 2024 Oficial</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Existem duas formas de obter o Office 2024: através da ferramenta oficial da Microsoft (Office Deployment Tool) ou utilizando o instalador oficial direto.
              </p>
              <div class="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50/50">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Método 1: Office Deployment Tool</h3>
                <ol class="space-y-3 text-gray-700 list-decimal list-inside">
                  <li>Baixe a <strong>Office Deployment Tool</strong> no site oficial da Microsoft</li>
                  <li>Extraia para uma pasta (ex: C:\Office2024)</li>
                  <li>Crie um arquivo XML de configuração</li>
                  <li>Execute no Prompt de Comando como Administrador: <code>setup.exe /configure configuration.xml</code></li>
                </ol>
              </div>
              <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p class="text-gray-700">
                  <strong>Dica:</strong> Compre na Casa do Software e receba o <strong>link de download oficial</strong> + <strong>chave de ativação</strong> + suporte completo.
                </p>
                <NuxtLink
                  to="/produto/microsoft-office-2024-pro-plus-licenca-permanente-1-pc"
                  class="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Ver Oferta Office 2024 →
                </NuxtLink>
              </div>
            </section>

            <!-- Seção 3 -->
            <section id="instalacao">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Instalação Passo a Passo</h2>
              <div class="space-y-4">
                <div class="flex gap-4">
                  <div class="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Desinstale versões antigas</h3>
                    <p class="text-gray-600 text-sm">Painel de Controle → Programas → Desinstale versões antigas do Office.</p>
                  </div>
                </div>
                <div class="flex gap-4">
                  <div class="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Execute como Administrador</h3>
                    <p class="text-gray-600 text-sm">Clique direito no instalador → "Executar como administrador".</p>
                  </div>
                </div>
                <div class="flex gap-4">
                  <div class="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Aguarde a instalação</h3>
                    <p class="text-gray-600 text-sm">Processo leva 5-15 minutos. Não desligue o computador.</p>
                  </div>
                </div>
                <div class="flex gap-4">
                  <div class="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Reinicie o computador</h3>
                    <p class="text-gray-600 text-sm">Reinicie para garantir configuração completa.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Seção 4 -->
            <section id="ativacao">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ativação Oficial do Office 2024</h2>
              <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Método Online (Recomendado)</h3>
                <ol class="space-y-2 text-gray-700 list-decimal list-inside">
                  <li>Abra qualquer aplicativo do Office (Word, Excel)</li>
                  <li>Clique em <strong>Arquivo</strong> → <strong>Conta</strong></li>
                  <li>Clique em <strong>Ativar Produto</strong></li>
                  <li>Digite a chave de 25 caracteres</li>
                  <li>Clique em <strong>Continuar</strong> e aguarde</li>
                </ol>
              </div>
              <div class="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <strong>Importante:</strong> Sua chave vincula-se ao hardware. Se formatar, pode reativar. Evite ativadores piratas - podem conter vírus.
              </div>
            </section>

            <!-- Seção 5 -->
            <section id="erros">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Erros Comuns e Soluções</h2>
              <div class="space-y-3">
                <div class="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                  <h3 class="font-semibold text-gray-900">Erro 0xC004F074</h3>
                  <p class="text-gray-700 text-sm mt-1">Verifique data/hora do sistema. Execute <code>sfc /scannow</code>.</p>
                </div>
                <div class="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                  <h3 class="font-semibold text-gray-900">"O Office não pode ser ativado"</h3>
                  <p class="text-gray-700 text-sm mt-1">Use a <a href="https://aka.ms/uninstalloffice" target="_blank" class="text-blue-600 underline">Ferramenta de Remoção da Microsoft</a> para desinstalar versões antigas.</p>
                </div>
                <div class="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                  <h3 class="font-semibold text-gray-900">Erro 30015 na instalação</h3>
                  <p class="text-gray-700 text-sm mt-1">Desative antivírus temporariamente e execute como administrador.</p>
                </div>
              </div>
            </section>

            <!-- Seção 6 -->
            <section id="comparacao">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Office 2024 vs 2021 vs 365</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-4 py-3 text-left">Recurso</th>
                      <th class="px-4 py-3 text-blue-600">Office 2024</th>
                      <th class="px-4 py-3">Office 2021</th>
                      <th class="px-4 py-3">Office 365</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr>
                      <td class="px-4 py-3 font-medium">Licença</td>
                      <td class="px-4 py-3 text-green-600 font-semibold">Permanente</td>
                      <td class="px-4 py-3">Permanente</td>
                      <td class="px-4 py-3 text-amber-600">Assinatura</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-medium">Preço</td>
                      <td class="px-4 py-3 text-green-600 font-semibold">R$ 79-149</td>
                      <td class="px-4 py-3">R$ 69-129</td>
                      <td class="px-4 py-3 text-red-500">R$ 279/ano</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-medium">Copilot/IA</td>
                      <td class="px-4 py-3 text-green-600">Sim</td>
                      <td class="px-4 py-3">Não</td>
                      <td class="px-4 py-3 text-green-600">Sim</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-3 font-medium">OneDrive</td>
                      <td class="px-4 py-3">Não</td>
                      <td class="px-4 py-3">Não</td>
                      <td class="px-4 py-3 text-green-600">1TB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-4 flex gap-4">
                <NuxtLink to="/blog/office-2024-vs-office-365" class="text-blue-600 hover:underline text-sm">Comparação completa →</NuxtLink>
                <NuxtLink to="/blog/como-ativar-microsoft-office-365" class="text-blue-600 hover:underline text-sm">Guia Office 365 →</NuxtLink>
              </div>
            </section>

            <!-- Seção 8: FAQ -->
            <section id="faq">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes sobre Office 2024</h2>
              <div class="space-y-3">
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Onde baixar Office 2024 com segurança? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    O download seguro do Office 2024 deve ser feito através da <strong>Microsoft oficial</strong> (Office Deployment Tool) ou do <strong>link oficial</strong> fornecido após a compra de uma licença original. 
                    <NuxtLink to="/blog/office-2024-download-seguro" class="text-blue-600 hover:underline block mt-2">Saiba mais sobre download seguro →</NuxtLink>
                  </div>
                </details>
                <details class="group bg-red-50 rounded-xl border border-red-100">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-red-900">É seguro usar ativador Office 2024? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    <strong class="text-red-700">Não é seguro.</strong> Ativadores podem conter malwares, vírus e spywares invisíveis. Além disso, a ativação pode falhar a qualquer momento, deixando você sem acesso aos programas. 
                    <NuxtLink to="/blog/office-2024-ativador-riscos" class="text-blue-600 hover:underline block mt-2">Conheça todos os riscos de ativadores →</NuxtLink>
                  </div>
                </details>
                <details class="group bg-red-50 rounded-xl border border-red-100">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-red-900">Office 2024 torrent é confiável? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    <strong class="text-red-700">Não é confiável.</strong> Arquivos de torrent são frequentemente adulterados com backdoors, ransomware e códigos maliciosos. Seus dados pessoais e bancários ficam em risco.
                    <NuxtLink to="/blog/office-2024-torrent-riscos" class="text-blue-600 hover:underline block mt-2">Entenda os perigos dos torrents →</NuxtLink>
                  </div>
                </details>
                <details class="group bg-green-50 rounded-xl border border-green-100">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-green-900">Como ativar Office 2024 com licença original? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    Com uma licença original, a ativação é simples: abra qualquer aplicativo do Office (Word, Excel), vá em <strong>Arquivo → Conta → Ativar Produto</strong>, digite sua chave de 25 caracteres e clique em "Continuar". A ativação é permanente e válida para o computador instalado.
                    <NuxtLink to="/blog/como-ativar-office-2024-com-licenca-original" class="text-blue-600 hover:underline block mt-2">Guia completo de ativação →</NuxtLink>
                  </div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Qual a diferença entre Office 2024 e Office 365? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    O <strong>Office 2024</strong> é uma licença perpétua (paga uma vez, usa para sempre), já o <strong>Office 365</strong> é uma assinatura mensal/anual que inclui 1TB de OneDrive e atualizações contínuas. O Office 2024 é mais econômico a longo prazo.
                    <NuxtLink to="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive" class="text-blue-600 hover:underline block mt-2">Ver Office 365 →</NuxtLink>
                  </div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">A Casa do Software oferece suporte de instalação? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">
                    <strong>Sim!</strong> Toda licença comprada na Casa do Software inclui <strong>suporte técnico especializado</strong> para instalação e ativação. Nossa equipe está disponível para ajudar via chat, e-mail ou WhatsApp durante o processo completo.
                  </div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">O Office 2024 funciona offline? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Sim! O Office 2024 funciona 100% offline após a ativação. Você só precisa de internet na instalação e ativação inicial. Com licença original, não há necessidade de conexão constante.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">E se eu formatar o PC? Perdi a licença? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Não! Com a licença original da Casa do Software, você pode reativar o Office com a mesma chave após formatar. A licença pode ser transferida em caso de substituição do equipamento.</div>
                </details>
              </div>
            </section>

            <!-- Seção 9: CTA Final -->
            <section id="oferta" class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white">
              <div class="text-center mb-6">
                <span class="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-semibold mb-4">PROTEJA SEU COMPUTADOR</span>
                <h2 class="text-2xl md:text-3xl font-bold">Instale o Office 2024 com Segurança</h2>
                <p class="mt-3 text-blue-100 max-w-2xl mx-auto">
                  Evite ativadores, cracks e torrents. Receba sua licença digital por e-mail com instruções de instalação e suporte especializado da Casa do Software.
                </p>
              </div>
              <div class="flex flex-col md:flex-row items-center justify-center gap-4">
                <NuxtLink
                  to="/produto/office-ltsc-pro-plus-2024"
                  class="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl shadow-lg text-center transition"
                  data-cta="office-2024-final"
                >
                  Comprar Office 2024 →
                </NuxtLink>
                <NuxtLink
                  to="/produto/microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive"
                  class="bg-blue-500/50 hover:bg-blue-500/70 text-white font-semibold px-8 py-4 rounded-xl text-center border border-white/30 transition"
                >
                  Ver Office 365 (5 dispositivos)
                </NuxtLink>
              </div>
              <div class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-200">
                <span class="flex items-center gap-1">🔒 Pagamento Seguro</span>
                <span class="flex items-center gap-1">⚡ Entrega Imediata</span>
                <span class="flex items-center gap-1">🛡️ Garantia de Ativação</span>
                <span class="flex items-center gap-1">💬 Suporte 24/7</span>
              </div>
            </section>

            <!-- Links Internos -->
            <section class="border-t pt-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Leia também</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <NuxtLink to="/blog/office-2024-ativador-riscos" class="p-4 border border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50">
                  <h4 class="font-semibold text-red-700">⚠️ Riscos do Ativador Office 2024</h4>
                  <p class="text-sm text-gray-600">Por que ativadores podem comprometer seu computador.</p>
                </NuxtLink>
                <NuxtLink to="/blog/office-2024-torrent-riscos" class="p-4 border border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50">
                  <h4 class="font-semibold text-red-700">⚠️ Perigos do Torrent Office 2024</h4>
                  <p class="text-sm text-gray-600">Arquivos adulterados, malwares e ransomware.</p>
                </NuxtLink>
                <NuxtLink to="/blog/office-2024-crack-riscos" class="p-4 border border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50">
                  <h4 class="font-semibold text-red-700">⚠️ Riscos do Crack Office 2024</h4>
                  <p class="text-sm text-gray-600">Instabilidade, perda de dados e problemas legais.</p>
                </NuxtLink>
                <NuxtLink to="/blog/como-ativar-office-2024-com-licenca-original" class="p-4 border border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50">
                  <h4 class="font-semibold text-green-700">✅ Como Ativar com Licença Original</h4>
                  <p class="text-sm text-gray-600">Guia completo de ativação segura e oficial.</p>
                </NuxtLink>
                <NuxtLink to="/blog/office-2024-download-seguro" class="p-4 border border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50">
                  <h4 class="font-semibold text-blue-700">📥 Download Seguro Office 2024</h4>
                  <p class="text-sm text-gray-600">Fontes oficiais e métodos seguros de download.</p>
                </NuxtLink>
                <NuxtLink to="/blog/como-instalar-office-2024-ltsc" class="p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50">
                  <h4 class="font-semibold text-gray-900">Instalar Office 2024 LTSC</h4>
                  <p class="text-sm text-gray-600">Versão corporativa para empresas e usuários avançados.</p>
                </NuxtLink>
              </div>
            </section>

          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const route = useRoute()
const intl = useIntlContext()

const langPrefix = computed(() => {
  const p = String(route.path || '')
  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const first = p.split('/').filter(Boolean)[0] || ''
  if (first && langs.includes(first)) return `/${first}`
  return ''
})

const siteUrl = useSiteUrl()
const { siteName, logoPath, companyLegalName } = useSiteBranding()

// SEO Meta
const title = 'Office 2024: Download, Instalação e Ativação Oficial | Casa do Software'
const description = 'Guia completo para baixar, instalar e ativar o Microsoft Office 2024. Versão oficial com licença permanente. Resolva erros comuns e escolha a melhor versão.'
const canonicalUrl = 'https://casadosoftware.com.br/blog/baixar-office-2024'
const imageUrl = 'https://pub-388810139d004c3eb59d2d54c6e92aa7.r2.dev/uploads/office-2024-hero.png'

// Schema JSON-LD
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Office 2024: Download, Instalação e Ativação Oficial',
    description,
    image: [imageUrl],
    datePublished: '2024-10-01T00:00:00-03:00',
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: companyLegalName || siteName,
      url: 'https://casadosoftware.com.br'
    },
    publisher: {
      '@type': 'Organization',
      name: companyLegalName || siteName,
      logo: {
        '@type': 'ImageObject',
        url: logoPath || 'https://casadosoftware.com.br/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    url: canonicalUrl,
    inLanguage: 'pt-BR',
    keywords: 'Office 2024, download Office 2024, instalar Office 2024, ativar Office 2024, licença Office 2024, Office 2024 vs 365, ativador Office 2024 riscos, torrent Office 2024 perigos'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Onde baixar Office 2024 com segurança?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O download seguro do Office 2024 deve ser feito através da Microsoft oficial (Office Deployment Tool) ou do link oficial fornecido após a compra de uma licença original na Casa do Software.'
        }
      },
      {
        '@type': 'Question',
        name: 'É seguro usar ativador Office 2024?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não é seguro. Ativadores podem conter malwares, vírus e spywares invisíveis. Além disso, a ativação pode falhar a qualquer momento, deixando você sem acesso aos programas. Recomendamos sempre usar licenças originais.'
        }
      },
      {
        '@type': 'Question',
        name: 'Office 2024 torrent é confiável?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não é confiável. Arquivos de torrent são frequentemente adulterados com backdoors, ransomware e códigos maliciosos. Seus dados pessoais e bancários ficam em risco. Use sempre fontes oficiais.'
        }
      },
      {
        '@type': 'Question',
        name: 'Como ativar Office 2024 com licença original?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Com uma licença original, a ativação é simples: abra qualquer aplicativo do Office (Word, Excel), vá em Arquivo → Conta → Ativar Produto, digite sua chave de 25 caracteres e clique em Continuar. A ativação é permanente e válida para o computador instalado.'
        }
      },
      {
        '@type': 'Question',
        name: 'Qual a diferença entre Office 2024 e Office 365?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O Office 2024 é uma licença perpétua (paga uma vez, usa para sempre), já o Office 365 é uma assinatura mensal/anual que inclui 1TB de OneDrive e atualizações contínuas. O Office 2024 é mais econômico a longo prazo.'
        }
      },
      {
        '@type': 'Question',
        name: 'A Casa do Software oferece suporte de instalação?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! Toda licença comprada na Casa do Software inclui suporte técnico especializado para instalação e ativação. Nossa equipe está disponível para ajudar via chat, e-mail ou WhatsApp durante o processo completo.'
        }
      },
      {
        '@type': 'Question',
        name: 'O Office 2024 funciona offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! O Office 2024 é uma versão permanente que funciona 100% offline após a ativação. Você só precisa de internet na instalação e ativação inicial. Com licença original, não há necessidade de conexão constante.'
        }
      },
      {
        '@type': 'Question',
        name: 'E se eu formatar meu computador? Perdi a licença?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não! Com a licença original da Casa do Software, você pode reativar o Office com a mesma chave após formatar. A licença pode ser transferida em caso de substituição do equipamento.'
        }
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://casadosoftware.com.br/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://casadosoftware.com.br/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Office 2024: Download, Instalação e Ativação Oficial',
        item: canonicalUrl
      }
    ]
  }
]

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd)
    }
  ]
}))

function formatDate(input: string) {
  try {
    const map: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES'
    }
    const loc = map[String(locale.value || 'pt')] || 'pt-BR'
    return new Date(input).toLocaleDateString(loc)
  } catch {
    return input
  }
}
</script>

<style scoped>
.blog-content h2 {
  scroll-margin-top: 100px;
}
.blog-content h3 {
  scroll-margin-top: 100px;
}
details > summary::-webkit-details-marker {
  display: none;
}
details > summary {
  list-style: none;
}
</style>
