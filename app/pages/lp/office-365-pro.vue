<template>
  <div class="lp-page bg-white min-h-screen font-sans">

    <!-- ═══════════════════════════════════════════
         SEÇÃO 1 — HERO (dobra principal)
    ════════════════════════════════════════════════ -->
    <section class="lp-hero bg-[#0a1628] text-white">
      <div class="lp-hero-container max-w-3xl mx-auto px-5 pt-10 pb-12 text-center">

        <!-- Badge urgência -->
        <div class="lp-badge inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/40 px-4 py-1.5 text-sm font-bold text-red-300 mb-6 uppercase tracking-wide">
          <span class="h-2 w-2 rounded-full bg-red-400 flex-shrink-0" aria-hidden="true" />
          ? DESCONTO EXPIRA HOJE
        </div>

        <!-- Headline principal -->
        <h1 class="lp-title text-3xl sm:text-4xl md:text-5xl font-black leading-[1.08] tracking-tight mb-4">
          SEU OFFICE FOI BLOQUEADO?<br />
          <span class="text-green-400">Ative em menos de 5 minutos ? sem mensalidade</span>
        </h1>

        <!-- Subheadline -->
        <p class="lp-subtitle text-blue-200 text-lg md:text-xl mb-8 leading-relaxed">
          Licen?a original ? sem mensalidade, sem renova??o. Funciona em PC, Mac, Android e iOS.
        </p>
        <img
          src="/images/hero.webp"
          alt="Office 365"
          width="600"
          height="600"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          class="lp-hero-image mx-auto mb-8 h-48 w-48 md:h-64 md:w-64 object-contain"
        />

        <!-- Bloco de preço -->
        <div class="lp-price inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-5 mb-7">
          <span class="text-sm text-gray-400 line-through mb-1">De R$199</span>
          <div class="flex items-end gap-2 leading-none">
            <span class="text-green-400 text-5xl md:text-6xl font-black">R$49</span>
            <span class="text-green-300 text-lg font-bold mb-1">hoje</span>
          </div>
          <span class="mt-2 text-xs text-yellow-300 font-semibold uppercase tracking-widest">? ?ltimas licen?as com desconto</span>
          <span class="mt-1 text-xs text-blue-300 font-medium">Menos de R$2 por dia</span>
        </div>

        <!-- Botão CTA principal -->
        <div class="flex flex-col items-center gap-3">
          <a
            href="/checkout"
            class="lp-cta w-full max-w-sm inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black text-xl py-5 px-8 rounded-2xl"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            LIBERAR MEU OFFICE AGORA
          </a>

          <!-- Subtexto de confiança -->
          <p class="text-sm text-blue-200 leading-relaxed">? Entrega imediata  ?  ? Funciona em PC e celular  ?  ? Suporte incluso</p>

          <!-- Contador de ativações recentes -->
          <div class="text-orange-300 text-sm font-bold">?? Mais de 150 ativa??es nas ?ltimas 24h</div>

          <!-- Alerta de escassez -->
          <div class="flex items-center gap-2 text-yellow-300 text-sm font-semibold">
            <span aria-hidden="true">⚠</span>Apenas 23 licen?as restantes com desconto
          </div>
        </div>

      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 2 — PROVA SOCIAL
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-900 border-b border-gray-800">
      <div class="max-w-3xl mx-auto px-5 py-5 flex items-center justify-center gap-3 text-center">
        <span class="text-yellow-400 text-xl tracking-tight">★★★★★</span>
        <span class="text-gray-200 font-bold text-sm md:text-base">+15.000 clientes j? ativaram com sucesso</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         PROVA SOCIAL STRIP (FASE 2)
    ════════════════════════════════════════════════ -->
    <section class="bg-blue-50 border-b border-blue-100">
      <div class="max-w-3xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-center">
        <span class="text-blue-700 text-sm font-semibold">✔ +15.000 clientes satisfeitos</span>
        <span class="hidden sm:block text-blue-200 text-xs">|</span>
        <span class="text-blue-700 text-sm font-semibold">✔ Avalia??o m?dia 5 estrelas</span>
        <span class="hidden sm:block text-blue-200 text-xs">|</span>
        <span class="text-blue-700 text-sm font-semibold">✔ Entrega em menos de 5 minutos</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 3 — DOR DO USUÁRIO
    ════════════════════════════════════════════════ -->
    <section class="bg-red-50 border-y border-red-100">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">O que acontece quando o Office n?o est? ativado?</h2>
        <p class="text-center text-gray-500 mb-2 text-sm">Se o seu Office est? bloqueado, voc? perde acesso a tudo.</p>
        <p class="text-center text-red-600 font-semibold text-sm mb-8">Sem ativa??o, voc? perde tempo e produtividade todos os dias.</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="flex items-start gap-3 bg-white rounded-xl border border-red-100 px-5 py-4 shadow-sm">
            <span class="text-red-500 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">🚫</span>
            <div><div class="font-bold text-gray-900 text-sm">Programas bloqueados</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Word, Excel e PowerPoint param de funcionar ou exibem alertas constantes.</div></div>
          </div>
          <div class="flex items-start gap-3 bg-white rounded-xl border border-red-100 px-5 py-4 shadow-sm">
            <span class="text-red-500 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
            <div><div class="font-bold text-gray-900 text-sm">Mensagens de erro constantes</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Avisos de Produto sem licença interrompem o seu trabalho toda hora.</div></div>
          </div>
          <div class="flex items-start gap-3 bg-white rounded-xl border border-red-100 px-5 py-4 shadow-sm">
            <span class="text-red-500 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">📉</span>
            <div><div class="font-bold text-gray-900 text-sm">Perda de produtividade</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Sem Office você perde tempo com alternativas lentas e limitadas.</div></div>
          </div>
          <div class="flex items-start gap-3 bg-white rounded-xl border border-red-100 px-5 py-4 shadow-sm">
            <span class="text-red-500 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">💾</span>
            <div><div class="font-bold text-gray-900 text-sm">Risco de perder arquivos</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Seus arquivos podem ser perdidos sem um sistema de backup adequado.</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 4 — SOLUÇÃO
    ════════════════════════════════════════════════ -->
    <section class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 text-center mb-2">Resolva em poucos minutos</h2>
        <p class="text-center text-gray-500 mb-1 text-sm">Processo de ativa??o simples e r?pido.</p>
        <p class="text-center text-blue-600 font-semibold text-sm mb-8">Mesmo que voc? n?o tenha conhecimento t?cnico.</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="flex items-start gap-4 bg-blue-50 rounded-xl border border-blue-100 px-5 py-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">1</div>
            <div><div class="font-bold text-gray-900 text-sm">Receba por e-mail</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Após o pagamento você recebe sua licença na caixa de entrada em minutos.</div></div>
          </div>
          <div class="flex items-start gap-4 bg-blue-50 rounded-xl border border-blue-100 px-5 py-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">2</div>
            <div><div class="font-bold text-gray-900 text-sm">Ative rapidamente</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Siga o passo a passo simples que enviamos junto com a licença.</div></div>
          </div>
          <div class="flex items-start gap-4 bg-blue-50 rounded-xl border border-blue-100 px-5 py-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">3</div>
            <div><div class="font-bold text-gray-900 text-sm">Use sem limitações</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Word, Excel, PowerPoint, Outlook e Teams completos.</div></div>
          </div>
          <div class="flex items-start gap-4 bg-blue-50 rounded-xl border border-blue-100 px-5 py-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">4</div>
            <div><div class="font-bold text-gray-900 text-sm">Funciona em tudo</div><div class="text-xs text-gray-500 mt-0.5 leading-relaxed">Instale em até 5 dispositivos: PC, Mac, Android e iOS.</div></div>
          </div>
        </div>

        <!-- CTA dentro da solução -->
        <div class="text-center mt-10">
          <a
            href="/checkout"
            class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition shadow-lg shadow-green-200/60"
          >
            LIBERAR MEU OFFICE AGORA
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 5 — BENEFÍCIOS (cards)
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-50 border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">O que voc? leva com essa licen?a</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-blue-300 hover:bg-blue-50 transition"><div class="text-3xl mb-2" aria-hidden="true">⚡</div><div class="font-bold text-gray-900 text-sm leading-snug mb-1">Entrega imediata</div><div class="text-xs text-gray-500 leading-relaxed">Na sua caixa de entrada em minutos</div></div>
          <div class="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-blue-300 hover:bg-blue-50 transition"><div class="text-3xl mb-2" aria-hidden="true">💻</div><div class="font-bold text-gray-900 text-sm leading-snug mb-1">Até 5 dispositivos</div><div class="text-xs text-gray-500 leading-relaxed">PC, Mac, Android, iOS</div></div>
          <div class="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-blue-300 hover:bg-blue-50 transition"><div class="text-3xl mb-2" aria-hidden="true">🔒</div><div class="font-bold text-gray-900 text-sm leading-snug mb-1">Licença oficial</div><div class="text-xs text-gray-500 leading-relaxed">Sem bloqueios ou erros</div></div>
          <div class="rounded-xl border border-gray-200 bg-white p-5 text-center hover:border-blue-300 hover:bg-blue-50 transition"><div class="text-3xl mb-2" aria-hidden="true">💬</div><div class="font-bold text-gray-900 text-sm leading-snug mb-1">Suporte incluso</div><div class="text-xs text-gray-500 leading-relaxed">Ajuda para ativar quando precisar</div></div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 6 — O QUE ESTÁ INCLUSO
    ════════════════════════════════════════════════ -->
    <section class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">O que est? incluso no pacote</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span><div><div class="font-bold text-gray-900 text-sm">Microsoft Word</div><div class="text-xs text-gray-500 leading-relaxed mt-0.5">Crie e edite documentos, cartas e relatórios</div></div></div>
          <div class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span><div><div class="font-bold text-gray-900 text-sm">Microsoft Excel</div><div class="text-xs text-gray-500 leading-relaxed mt-0.5">Planilhas, gráficos e análises financeiras</div></div></div>
          <div class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span><div><div class="font-bold text-gray-900 text-sm">Microsoft PowerPoint</div><div class="text-xs text-gray-500 leading-relaxed mt-0.5">Apresentações profissionais para qualquer ocasião</div></div></div>
          <div class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span><div><div class="font-bold text-gray-900 text-sm">Microsoft Outlook</div><div class="text-xs text-gray-500 leading-relaxed mt-0.5">E-mail, calendário e contatos em um só lugar</div></div></div>
          <div class="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm mt-0.5">✓</span><div><div class="font-bold text-gray-900 text-sm">Microsoft Teams</div><div class="text-xs text-gray-500 leading-relaxed mt-0.5">Reuniões em vídeo e colaboração com sua equipe</div></div></div>
        </div>
      </div>
    </section>

    <!-- PROVA SOCIAL EXTRA (FASE 4) -->
    <section class="bg-orange-50 border-y border-orange-100">
      <div class="max-w-3xl mx-auto px-5 py-4 text-center">
        <span class="text-orange-700 font-bold text-sm">?? 327 ativa??es nas ?ltimas 24h</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEGURANÇA
    ════════════════════════════════════════════════ -->
    <section class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center">
        <div class="flex items-center gap-2 text-gray-700 text-sm font-semibold">🔒 Compra 100% segura</div>
        <div class="hidden sm:block w-px h-4 bg-gray-200" aria-hidden="true" />
        <div class="flex items-center gap-2 text-gray-700 text-sm font-semibold">💳 Pagamento protegido</div>
        <div class="hidden sm:block w-px h-4 bg-gray-200" aria-hidden="true" />
        <div class="flex items-center gap-2 text-gray-700 text-sm font-semibold">🛡️ Garantia de 30 dias</div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 7 — DEPOIMENTOS
    ════════════════════════════════════════════════ -->
    <section class="bg-gray-50 border-b">
      <div class="max-w-3xl mx-auto px-5 py-12">
        <h2 class="text-2xl font-black text-gray-900 text-center mb-8">Clientes que j? ativaram</h2>
        <div class="grid md:grid-cols-3 gap-5">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"><div class="text-yellow-400 text-lg tracking-tight mb-3">★★★★★</div><p class="text-gray-700 text-sm leading-relaxed flex-1 mb-4">"Estava desconfiado mas funcionou perfeitamente. Recebi em 3 minutos e ativei de primeira."</p><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">L</div><span class="text-xs font-bold text-gray-600">Lucas M.</span><span class="text-xs text-green-600 font-semibold ml-auto">✔ Verificado</span></div></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"><div class="text-yellow-400 text-lg tracking-tight mb-3">★★★★★</div><p class="text-gray-700 text-sm leading-relaxed flex-1 mb-4">"Instalei no PC, notebook e celular com a mesma licença. O suporte respondeu em minutos."</p><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">A</div><span class="text-xs font-bold text-gray-600">Ana S.</span><span class="text-xs text-green-600 font-semibold ml-auto">✔ Verificado</span></div></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col"><div class="text-yellow-400 text-lg tracking-tight mb-3">★★★★★</div><p class="text-gray-700 text-sm leading-relaxed flex-1 mb-4">"Tinha medo de comprar online, mas o suporte me acompanhou. Tudo ativado e funcionando."</p><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">C</div><span class="text-xs font-bold text-gray-600">Carlos R.</span><span class="text-xs text-green-600 font-semibold ml-auto">✔ Verificado</span></div></div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 8 — QUEBRA DE OBJEÇÃO
    ════════════════════════════════════════════════ -->
    <section class="bg-blue-700 text-white">
      <div class="max-w-3xl mx-auto px-5 py-12 text-center">
        <h2 class="text-2xl font-black mb-6">Ainda tem d?vidas?</h2>
        <div class="grid sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white/10 border border-white/20 rounded-xl px-5 py-5"><div class="text-green-300 text-2xl mb-2" aria-hidden="true">🛡️</div><div class="font-bold text-white text-sm mb-1">Garantia de 30 dias</div><div class="text-blue-200 text-xs leading-relaxed">Se não funcionar, devolvemos o seu dinheiro.</div></div>
          <div class="bg-white/10 border border-white/20 rounded-xl px-5 py-5"><div class="text-green-300 text-2xl mb-2" aria-hidden="true">💬</div><div class="font-bold text-white text-sm mb-1">Suporte após a compra</div><div class="text-blue-200 text-xs leading-relaxed">Nosso time te acompanha na ativação se precisar.</div></div>
          <div class="bg-white/10 border border-white/20 rounded-xl px-5 py-5"><div class="text-green-300 text-2xl mb-2" aria-hidden="true">⚡</div><div class="font-bold text-white text-sm mb-1">Ativação simples</div><div class="text-blue-200 text-xs leading-relaxed">Siga o tutorial enviado e ative em minutos.</div></div>
        </div>
        <a
          href="/checkout"
          class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition shadow-xl"
        >
          LIBERAR MEU OFFICE AGORA
        </a>
        <p class="mt-3 text-blue-200 text-xs">Pagamento seguro ? Entrega imediata ap?s confirma??o</p>
      </div>
    </section>

    <!-- BLOCO DECISÃO (FASE 5) -->
    <section class="bg-slate-100 border-y border-slate-200">
      <div class="max-w-2xl mx-auto px-5 py-10 text-center">
        <p class="text-gray-400 text-base mb-2 line-through decoration-gray-400">Voc? pode continuar com o Office bloqueado...</p>
        <p class="text-blue-700 text-xl md:text-2xl font-black">OU resolver agora em poucos minutos</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SEÇÃO 9 — CTA FINAL
    ════════════════════════════════════════════════ -->
    <section class="bg-[#0a1628] text-white">
      <div class="max-w-2xl mx-auto px-5 py-16 text-center">
        <div class="text-yellow-400 text-3xl mb-4" aria-hidden="true">⏳</div>
        <h2 class="text-2xl md:text-3xl font-black mb-3">? ?ltima chance de ativar com desconto</h2>
        <p class="text-blue-200 mb-3 text-sm leading-relaxed">Receba sua licen?a Microsoft 365 agora mesmo. Entrega imediata ap?s o pagamento.</p>
        <p class="text-yellow-300 text-sm font-bold mb-8">Ap?s hoje, o pre?o pode voltar ao valor normal.</p>

        <!-- Preço repetido -->
        <div class="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-8 py-4 mb-7">
          <span class="text-gray-400 line-through text-sm mb-1">De R$199</span>
          <span class="text-green-400 text-4xl font-black">R$49</span>
          <span class="text-xs text-yellow-300 font-semibold uppercase tracking-widest mt-1">? ?ltimas licen?as com desconto</span>
        </div>

        <div class="flex flex-col items-center gap-3">
          <div class="text-red-400 text-xs font-bold tracking-wide">? Apenas 23 licen?as restantes com desconto</div>
          <a
            href="/checkout"
            class="w-full max-w-sm inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black text-xl py-5 px-8 rounded-2xl shadow-xl shadow-green-900/40 transition-all hover:scale-[1.02]"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
            LIBERAR MEU OFFICE AGORA
          </a>
          <p class="text-blue-300 text-xs">Entrega imediata ap?s confirma??o do pagamento</p>
          <p class="text-red-400 text-xs font-bold mt-1 max-w-xs text-center">? Se voc? sair desta p?gina, o desconto pode n?o estar mais dispon?vel</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'lp', ssr: true })

useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/images/hero.webp', fetchpriority: 'high' }
  ]
})

useSeoMeta({
  title: 'Comprar Microsoft 365 ? Ative em 5 Minutos | Licen?a Original | Entrega Imediata',
  description: 'Seu Office parou de funcionar? Obtenha o Microsoft 365 original para at? 5 dispositivos. Word, Excel, PowerPoint e Outlook. Entrega imediata e garantia de 30 dias.',
  robots: 'index,follow'
})
</script>

<style scoped>
.lp-page {
  min-height: 100vh;
  background: #fff;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.lp-hero {
  background: #0a1628;
  color: #fff;
}

.lp-hero-container {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 3rem;
  text-align: center;
}

.lp-badge {
  margin-bottom: 1.5rem;
  border: 1px solid rgba(239, 68, 68, .4);
  border-radius: 9999px;
  background: rgba(220, 38, 38, .18);
  color: #fca5a5;
}

.lp-title {
  margin: 0 0 1rem;
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.08;
}

.lp-subtitle {
  margin: 0 0 2rem;
  color: #bfdbfe;
  font-size: 1.125rem;
  line-height: 1.55;
}

.lp-hero-image {
  display: block;
  width: 12rem;
  height: 12rem;
  margin: 0 auto 2rem;
  object-fit: contain;
}

.lp-price {
  margin-bottom: 1.75rem;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, .05);
  padding: 1.25rem 2rem;
}

.lp-cta {
  width: 100%;
  max-width: 24rem;
  border-radius: 1rem;
  background: #22c55e;
  color: #fff;
  padding: 1.25rem 2rem;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.2;
  text-decoration: none;
}

@media (min-width: 768px) {
  .lp-title {
    font-size: 3rem;
  }

  .lp-subtitle {
    font-size: 1.25rem;
  }

  .lp-hero-image {
    width: 16rem;
    height: 16rem;
  }
}
</style>
