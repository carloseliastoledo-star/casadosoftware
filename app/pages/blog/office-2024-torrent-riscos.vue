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
            <span class="text-gray-700 font-medium">Perigos do Torrent Office 2024</span>
          </nav>

          <header class="max-w-4xl">
            <p class="text-xs font-semibold tracking-wide text-red-600 uppercase">⚠️ Alerta de Segurança</p>
            <h1 class="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Por Que Não Baixar Office 2024 via Torrent
            </h1>
            <p class="mt-4 text-lg text-gray-600 leading-relaxed">
              Torrents de Office 2024 prometem download grátis, mas escondem arquivos adulterados, malwares e ransomware. Descubra os perigos reais e a solução segura.
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span>Atualizado em {{ formatDate(new Date().toISOString()) }}</span>
              <span>7 min de leitura</span>
            </div>
          </header>

          <div class="mt-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🛡️</span>
              <div>
                <h2 class="font-semibold text-red-900">Este artigo tem fins educativos</h2>
                <p class="text-red-800 text-sm mt-1">
                  Não fornecemos links de torrent. Nosso objetivo é alertar sobre os riscos de segurança e apresentar a <strong>alternativa segura de licença original</strong>.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 md:p-8 text-white">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 class="text-xl md:text-2xl font-bold">Download Seguro do Office 2024</h2>
                <p class="mt-2 text-green-100">Evite arquivos adulterados de torrent. Obtenha o Office 2024 oficial com licença garantida.</p>
              </div>
              <NuxtLink
                to="/produto/office-ltsc-pro-plus-2024"
                class="shrink-0 bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
              >
                Licença Original →
              </NuxtLink>
            </div>
          </div>

          <div class="mt-8 blog-content space-y-10">
            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">O Risco Real dos Torrents de Office</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Quando você baixa Office 2024 via torrent, não tem como verificar se o arquivo é genuíno. Criminosos aproveitam a popularidade do software para distribuir <strong>malware disfarçado de instalador legítimo</strong>.
              </p>
              
              <div class="bg-red-50 border border-red-200 rounded-xl p-5 mt-4">
                <h3 class="font-semibold text-red-800 mb-3">Estatísticas Alarmantes</h3>
                <ul class="space-y-2 text-red-700 text-sm">
                  <li>• <strong>65%</strong> dos torrents de software popular contêm malware (Kaspersky Labs)</li>
                  <li>• <strong>1 em cada 3</strong> downloads de software via P2P resulta em infecção</li>
                  <li>• Ransomware disseminado principalmente por torrents de software</li>
                  <li>• Média de <strong>42 dias</strong> para detecção de malware em novos torrents</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ameaças em Arquivos Torrent</h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 class="font-semibold text-amber-900 mb-2">🦠 Backdoors</h4>
                  <p class="text-sm text-amber-800">Portas secretas que permitem acesso remoto ao seu computador mesmo após a "instalação" do Office.</p>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 class="font-semibold text-amber-900 mb-2">🔐 Ransomware</h4>
                  <p class="text-sm text-amber-800">Criptografa documentos, fotos e arquivos importantes exigindo pagamento para liberação.</p>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 class="font-semibold text-amber-900 mb-2">📊 Spyware</h4>
                  <p class="text-sm text-amber-800">Monitora sua navegação, captura senhas e envia dados pessoais para servidores de criminosos.</p>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 class="font-semibold text-amber-900 mb-2">⛏️ Mineradores</h4>
                  <p class="text-sm text-amber-800">Usam seu processador e placa de vídeo para minerar criptomoedas, degradando seu hardware.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Problemas Além do Malware</h2>
              <div class="space-y-4">
                <div class="border-l-4 border-orange-400 pl-4">
                  <h4 class="font-semibold text-gray-900">Arquivos Incompletos ou Corrompidos</h4>
                  <p class="text-gray-600 text-sm mt-1">Torrents podem ter seeds falsos que distribuem versões incompletas, causando erros na instalação.</p>
                </div>
                <div class="border-l-4 border-orange-400 pl-4">
                  <h4 class="font-semibold text-gray-900">Sem Atualizações de Segurança</h4>
                  <p class="text-gray-600 text-sm mt-1">Versões baixadas via torrent não recebem atualizações críticas de segurança da Microsoft.</p>
                </div>
                <div class="border-l-4 border-orange-400 pl-4">
                  <h4 class="font-semibold text-gray-900">Exposição de IP</h4>
                  <p class="text-gray-600 text-sm mt-1">Ao fazer torrent, seu IP fica visível para todos na rede, incluindo empresas de segurança e hackers.</p>
                </div>
              </div>
            </section>

            <div class="my-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
              <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 class="text-xl md:text-2xl font-bold">Não arrisque seus arquivos</h2>
                  <p class="mt-2 text-indigo-100">Um único download de torrent pode resultar na perda de anos de fotos, documentos e trabalhos importantes.</p>
                </div>
                <NuxtLink
                  to="/produto/office-ltsc-pro-plus-2024"
                  class="shrink-0 bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl transition shadow-lg text-center"
                >
                  Office 2024 Original →
                </NuxtLink>
              </div>
            </div>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">A Alternativa Segura: Download Oficial</h2>
              <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-green-800 mb-4">Por que escolher download oficial?</h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700"><strong>Arquivo 100% genuíno</strong> - Download direto dos servidores Microsoft</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700"><strong>Zero risco de malware</strong> - Código fonte verificado e assinado digitalmente</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700"><strong>Atualizações automáticas</strong> - Receba todos os patches de segurança</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-green-600 font-bold">✓</span>
                    <span class="text-gray-700"><strong>Suporte técnico</strong> - Ajuda especializada para instalação e ativação</span>
                  </div>
                </div>

                <NuxtLink
                  to="/blog/office-2024-download-seguro"
                  class="inline-block mt-6 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Saiba mais sobre download seguro →
                </NuxtLink>
              </div>
            </section>

            <section>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
              <div class="space-y-3">
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Torrents de Office são sempre perigosos? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">A grande maioria contém algum tipo de risco. Mesmo torrents que aparentam ter muitos "seeds" positivos podem ter sido manipulados. Não há garantia de segurança.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Como identificar se um torrent tem malware? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">É praticamente impossível identificar visualmente. Antivírus nem sempre detectam ameaças zero-day. A única proteção 100% efetiva é não usar torrents de software.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">VPN protege contra os riscos de torrent? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">VPN oculta seu IP, mas NÃO protege contra malware no arquivo baixado. Se o torrent contém vírus, ele infectará seu computador independente da VPN.</div>
                </details>
                <details class="group bg-gray-50 rounded-xl">
                  <summary class="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900">Qual o custo de uma licença original vs recuperação de dados? <span>▼</span></summary>
                  <div class="px-4 pb-4 text-gray-700 text-sm">Uma licença original do Office 2024 na Casa do Software custa a partir de R$ 79. Recuperação de dados após ransomware custa R$ 2.000-10.000+ e nem sempre é possível.</div>
                </details>
              </div>
            </section>

            <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white">
              <div class="text-center mb-6">
                <span class="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-semibold mb-4">PROTEJA SEUS DADOS</span>
                <h2 class="text-2xl md:text-3xl font-bold">Download Seguro do Office 2024</h2>
                <p class="mt-3 text-blue-100 max-w-2xl mx-auto">
                  Não arrisque seu computador com torrents perigosos. Office 2024 original com download garantido da Microsoft.
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
const title = 'Perigos do Torrent Office 2024: Por Que Não Usar | Casa do Software'
const description = 'Torrents de Office 2024 escondem malware, ransomware e arquivos adulterados. Entenda os riscos reais e escolha o download seguro com licença original.'
const canonicalUrl = 'https://casadosoftware.com.br/blog/office-2024-torrent-riscos'
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Por Que Não Baixar Office 2024 via Torrent: Riscos de Segurança',
    description,
    datePublished: '2024-10-01T00:00:00-03:00',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: companyLegalName || siteName, url: 'https://casadosoftware.com.br' },
    publisher: { '@type': 'Organization', name: companyLegalName || siteName, logo: { '@type': 'ImageObject', url: logoPath || 'https://casadosoftware.com.br/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
    inLanguage: 'pt-BR',
    keywords: 'torrent Office 2024 perigos, Office 2024 torrent riscos, malware torrent Office, download seguro Office 2024, ransomware torrent'
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://casadosoftware.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://casadosoftware.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: 'Perigos do Torrent Office 2024', item: canonicalUrl }
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
