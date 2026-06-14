<template>
  <section class="bg-gray-50 min-h-screen py-10 md:py-14">
    <div class="max-w-6xl mx-auto px-6">
      <article class="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="p-6 md:p-8 lg:p-10">
          <nav class="text-xs text-gray-500 mb-5">
            <NuxtLink :to="`${langPrefix}/`" class="hover:text-blue-700 transition">Home</NuxtLink>
            <span class="mx-2">/</span>
            <NuxtLink :to="`${langPrefix}/blog`" class="hover:text-blue-700 transition">Blog</NuxtLink>
            <span class="mx-2">/</span>
            <span class="text-gray-700 font-medium">Download Seguro Office 2024</span>
          </nav>

          <header class="max-w-4xl">
            <p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">📥 Download Oficial</p>
            <h1 class="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Como Baixar Office 2024 com Segurança
            </h1>
            <p class="mt-4 text-lg text-gray-600 leading-relaxed">
              Guia completo para download seguro do Microsoft Office 2024. Fontes oficiais, verificação de arquivos e instalação protegida com licença original.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span>Atualizado em {{ formatDate(new Date().toISOString()) }}</span>
              <span>6 min de leitura</span>
            </div>
          </header>

          <div class="mt-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5">
            <div class="flex items-start gap-3">
              <span class="text-2xl">⚠️</span>
              <div>
                <h2 class="font-semibold text-amber-900">Evite Fontes Não Oficiais</h2>
                <p class="text-amber-800 text-sm mt-1">
                  Downloads de sites desconhecidos, torrents ou links de fóruns podem conter <strong>malware disfarçado</strong>. Este guia mostra apenas fontes seguras e verificadas.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 md:p-8 text-white">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 class="text-xl md:text-2xl font-bold">Quer download garantido + licença?</h2>
                <p class="mt-2 text-blue-100">Na Casa do Software você recebe o link oficial de download + chave de ativação + suporte completo.</p>
              </div>
              <NuxtLink
                to="/produto/office-ltsc-pro-plus-2024"
                class="shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
              >
                Obter Office 2024 →
              </NuxtLink>
            </div>
          </div>

          <div class="mt-8 blog-content space-y-10">
            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Por Que a Fonte de Download Importa</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                O Microsoft Office 2024 é um software complexo que requer arquivos específicos e assinados digitalmente. Baixar de fontes não oficiais expõe você a:
              </p>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 class="font-semibold text-red-800 mb-2">🦠 Malware</h4>
                  <p class="text-red-700 text-sm">Vírus e spywares embutidos no instalador</p>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 class="font-semibold text-red-800 mb-2">📁 Arquivos Corrompidos</h4>
                  <p class="text-red-700 text-sm">Downloads incompletos que não funcionam</p>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 class="font-semibold text-red-800 mb-2">🔓 Backdoors</h4>
                  <p class="text-red-700 text-sm">Portas secretas para acesso remoto</p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Método 1: Office Deployment Tool (ODT)</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                A ferramenta oficial da Microsoft para download e instalação do Office 2024. É o método mais seguro e flexível.
              </p>

              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="font-semibold text-gray-900 mb-4">Passo a passo:</h3>
                <div class="space-y-4">
                  <div class="flex gap-3">
                    <span class="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <div>
                      <p class="text-gray-700 font-medium">Baixe o ODT no site oficial da Microsoft</p>
                      <p class="text-gray-500 text-sm">Acesse: microsoft.com/download/details.aspx?id=49117</p>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <span class="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <div>
                      <p class="text-gray-700 font-medium">Execute e extraia os arquivos</p>
                      <p class="text-gray-500 text-sm">Escolha uma pasta como C:\Office2024</p>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <span class="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <div>
                      <p class="text-gray-700 font-medium">Crie o arquivo de configuração XML</p>
                      <p class="text-gray-500 text-sm">Define quais aplicativos instalar</p>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <span class="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                    <div>
                      <p class="text-gray-700 font-medium">Execute como Administrador</p>
                      <p class="text-gray-500 text-sm">No Prompt de Comando: setup.exe /configure configuration.xml</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p class="text-amber-800 text-sm">
                  <strong>Nota:</strong> O ODT requer conhecimento técnico. Se preferir um método mais simples, compre na Casa do Software e receba o link direto de download.
                </p>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Método 2: Link de Download Oficial (Recomendado)</h2>
              <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 class="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span>✅</span> Via Casa do Software
                </h3>
                <p class="text-gray-700 mb-4">
                  Ao adquirir sua licença original na Casa do Software, você recebe:
                </p>
                <div class="grid md:grid-cols-2 gap-3">
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700 text-sm">Link direto de download oficial Microsoft</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700 text-sm">Chave de ativação de 25 caracteres</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700 text-sm">Tutorial passo a passo</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700 text-sm">Suporte para instalação</span>
                  </div>
                </div>

                <NuxtLink
                  to="/produto/office-ltsc-pro-plus-2024"
                  class="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Obter Download + Licença →
                </NuxtLink>
              </div>
            </section>

            <div class="my-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
              <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 class="text-xl md:text-2xl font-bold">Não arrisque downloads duvidosos</h2>
                  <p class="mt-2 text-indigo-100">Arquivos de sites não oficiais podem conter malware invisível. Fonte garantida = segurança garantida.</p>
                </div>
                <NuxtLink
                  to="/produto/office-ltsc-pro-plus-2024"
                  class="shrink-0 bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
                >
                  Download Seguro →
                </NuxtLink>
              </div>
            </div>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Como Verificar se o Download é Seguro</h2>
              <div class="space-y-4">
                <div class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-semibold text-gray-900">Verifique a URL</h4>
                  <p class="text-gray-600 text-sm mt-1">O download oficial da Microsoft sempre virá de domínios microsoft.com ou akamaihd.net (servidor de distribuição oficial).</p>
                </div>
                <div class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-semibold text-gray-900">Assinatura Digital</h4>
                  <p class="text-gray-600 text-sm mt-1">Arquivos oficiais possuem assinatura digital da Microsoft. Clique com botão direito no arquivo → Propriedades → Assinaturas Digitais.</p>
                </div>
                <div class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-semibold text-gray-900">Tamanho do Arquivo</h4>
                  <p class="text-gray-600 text-sm mt-1">O instalador do Office 2024 tem aproximadamente 2-4GB. Arquivos muito menores (menos de 1GB) provavelmente são incompletos ou maliciosos.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">O Que Fazer Após o Download</h2>
              <div class="bg-gray-50 rounded-xl p-6">
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 font-bold">1.</span>
                    <p class="text-gray-700"><strong>Verifique o antivírus:</strong> Faça uma verificação no arquivo baixado antes de executar.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 font-bold">2.</span>
                    <p class="text-gray-700"><strong>Desinstale versões antigas:</strong> Use o Painel de Controle ou a <a href="https://aka.ms/uninstalloffice" target="_blank" class="text-blue-600 underline">Ferramenta de Remoção da Microsoft</a>.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 font-bold">3.</span>
                    <p class="text-gray-700"><strong>Execute como Administrador:</strong> Clique direito no instalador → "Executar como administrador".</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 font-bold">4.</span>
                    <p class="text-gray-700"><strong>Aguarde a instalação:</strong> Processo leva 10-20 minutos. Não desligue o computador.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-blue-600 font-bold">5.</span>
                    <p class="text-gray-700"><strong>Ative com sua chave:</strong> Siga o <NuxtLink to="/blog/como-ativar-office-2024-com-licenca-original" class="text-blue-600 hover:underline">guia de ativação</NuxtLink>.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
              <div class="space-y-3">
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Posso baixar Office 2024 direto do site da Microsoft? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Sim, através do Office Deployment Tool. Porém, a Microsoft não fornece link direto de download simples para consumidores finais - você precisa de ferramentas técnicas ou uma licença que inclua o link.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">O download da Casa do Software é oficial? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Sim! Fornecemos links de download dos servidores oficiais da Microsoft. A diferença é que você recebe o link pronto + chave de ativação + suporte, sem precisar de conhecimentos técnicos.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Quanto tempo leva o download? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">O arquivo tem cerca de 2-4GB. Com uma conexão de 10Mbps, leva aproximadamente 30-50 minutos. Conexões mais rápidas (50Mbps+) completam em menos de 10 minutos.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Preciso de internet durante a instalação? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Sim. O instalador baixa componentes adicionais durante o processo. Mantenha a conexão ativa durante toda a instalação (10-20 minutos).</div>
                </details>
              </div>
            </section>

            <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white">
              <div class="text-center mb-6">
                <span class="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-semibold mb-4">DOWNLOAD 100% SEGURO</span>
                <h2 class="text-2xl md:text-3xl font-bold">Obtenha Office 2024 com Garantia</h2>
                <p class="mt-3 text-blue-100 max-w-2xl mx-auto">
                  Link de download oficial + chave de ativação + suporte especializado. Tudo que você precisa em um só lugar.
                </p>
              </div>
              <div class="flex flex-col md:flex-row items-center justify-center gap-4">
                <NuxtLink
                  to="/produto/office-ltsc-pro-plus-2024"
                  class="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl shadow-lg text-center transition"
                >
                  Comprar Office 2024 →
                </NuxtLink>
                <NuxtLink
                  to="/blog/baixar-office-2024"
                  class="bg-blue-500/50 hover:bg-blue-500/70 text-white font-semibold px-8 py-4 rounded-xl text-center border border-white/30 transition"
                >
                  Guia Completo
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
const langPrefix = computed(() => {
  const p = String(route.path || '')
  const langs = ['pt', 'en', 'es', 'fr', 'it', 'de']
  const first = p.split('/').filter(Boolean)[0] || ''
  if (first && langs.includes(first)) return `/${first}`
  return ''
})
const { siteName, logoPath, companyLegalName } = useSiteBranding()
const title = 'Download Seguro Office 2024: Guia Oficial | Casa do Software'
const description = 'Aprenda a baixar Office 2024 com segurança. Fontes oficiais, verificação de arquivos e download garantido da Microsoft com licença original.'
const canonicalUrl = 'https://casadosoftware.com.br/blog/office-2024-download-seguro'
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Como Baixar Office 2024 com Segurança: Guia de Download Oficial',
    description,
    datePublished: '2024-10-01T00:00:00-03:00',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: companyLegalName || siteName, url: 'https://casadosoftware.com.br' },
    publisher: { '@type': 'Organization', name: companyLegalName || siteName, logo: { '@type': 'ImageObject', url: logoPath || 'https://casadosoftware.com.br/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
    inLanguage: 'pt-BR',
    keywords: 'download Office 2024 seguro, baixar Office 2024 oficial, Office 2024 download Microsoft, Office Deployment Tool, download seguro Office'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Posso baixar Office 2024 direto do site da Microsoft?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, através do Office Deployment Tool. Porém, a Microsoft não fornece link direto de download simples para consumidores finais - você precisa de ferramentas técnicas ou uma licença que inclua o link.' } },
      { '@type': 'Question', name: 'O download da Casa do Software é oficial?', acceptedAnswer: { '@type': 'Answer', text: 'Sim! Fornecemos links de download dos servidores oficiais da Microsoft. A diferença é que você recebe o link pronto + chave de ativação + suporte, sem precisar de conhecimentos técnicos.' } },
      { '@type': 'Question', name: 'Quanto tempo leva o download?', acceptedAnswer: { '@type': 'Answer', text: 'O arquivo tem cerca de 2-4GB. Com uma conexão de 10Mbps, leva aproximadamente 30-50 minutos. Conexões mais rápidas (50Mbps+) completam em menos de 10 minutos.' } },
      { '@type': 'Question', name: 'Preciso de internet durante a instalação?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. O instalador baixa componentes adicionais durante o processo. Mantenha a conexão ativa durante toda a instalação (10-20 minutos).' } }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://casadosoftware.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://casadosoftware.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: 'Download Seguro Office 2024', item: canonicalUrl }
    ]
  }
]
useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description }
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }]
}))
function formatDate(input: string) {
  try { return new Date(input).toLocaleDateString('pt-BR') } catch { return input }
}
</script>

<style scoped>
.blog-content h2 { scroll-margin-top: 100px; }
details > summary::-webkit-details-marker { display: none; }
details > summary { list-style: none; }
</style>
