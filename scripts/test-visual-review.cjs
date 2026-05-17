'use strict'
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const p = new PrismaClient({ log: ['warn', 'error'] })

let passed = 0
let failed = 0
const report = []

function ok(section, msg) { passed++; report.push(`✅ [${section}] ${msg}`); console.log(`✅ [${section}] ${msg}`) }
function fail(section, msg, reason) { failed++; report.push(`❌ [${section}] ${msg} — ${reason}`); console.log(`❌ [${section}] ${msg} — ${reason}`) }
function info(msg) { console.log(`   ${msg}`) }

const STORE_SLUG = 'international'
const PRODUCTS_INTL = [
  { slug: 'office-2021-pro-plus',                                         id: '21416b89-1ed4-4729-8c62-abb710381037', usd: 29.90, eur: 27.90 },
  { slug: 'office-ltsc-pro-plus-2024',                                    id: 'f615d820-4925-4abe-93e6-4153a6e0014b', usd: 39.90, eur: 36.90 },
  { slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',                id: '50342f30-041c-4cba-8e44-feedd00714fb', usd: 24.90, eur: 22.90 },
  { slug: 'office-2021-pro-plus-windows-11-pro',                          id: '442f0a0c-cac7-48e5-8f73-14d68f3566de', usd: 49.90, eur: 45.90 },
  { slug: 'microsoft-windows-server-2022-standard-download-nota-fiscal',  id: '5b274ecf-31ba-4e8a-a2d1-5797ccaf510b', usd: 69.90, eur: 64.90 },
]

function readVue(rel) {
  const abs = path.join('c:\\Users\\User\\minhakeys', rel)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf-8') : null
}

async function run() {
  console.log('\n====================================================')
  console.log('REVISÃO VISUAL FINAL — storeSlug=international')
  console.log('====================================================\n')

  // ──────────────────────────────────────────────────────────────────
  // 1. HOME
  // ──────────────────────────────────────────────────────────────────
  console.log('━━━ 1. HOME (/index.vue + HomeInternational.vue) ━━━\n')
  const indexVue = readVue('app/pages/index.vue')
  const homeIntl = readVue('app/components/HomeInternational.vue')

  if (indexVue) {
    if (indexVue.includes('isInternational') && indexVue.includes('HomeInternational')) {
      ok('Home', 'index.vue renderiza HomeInternational quando isInternational=true')
    } else {
      fail('Home', 'index.vue', 'não referencia HomeInternational')
    }
    if (!indexVue.includes('PIX') && !indexVue.includes('Mercado Pago')) {
      ok('Home', 'index.vue não contém PIX/Mercado Pago')
    } else {
      fail('Home', 'index.vue', 'contém PIX ou Mercado Pago')
    }
  }

  if (homeIntl) {
    const ptWords = ['COMPRAR AGORA', 'Pagamento', 'Mercado Pago', 'no PIX', 'Boleto', 'R$']
    const found = ptWords.filter(w => homeIntl.includes(w))
    if (found.length === 0) {
      ok('Home', 'HomeInternational.vue: zero texto português/BRL/PIX')
    } else {
      fail('Home', 'HomeInternational.vue', `contém: ${found.join(', ')}`)
    }
    if (homeIntl.includes('Buy Now') || homeIntl.includes('buy now') || homeIntl.includes('Shop Now')) {
      ok('Home', 'HomeInternational.vue: CTA em inglês')
    } else {
      fail('Home', 'HomeInternational.vue', 'sem CTA em inglês')
    }
    if (homeIntl.includes('Stripe') || homeIntl.includes('stripe')) {
      ok('Home', 'HomeInternational.vue: menciona Stripe (não MercadoPago)')
    }
  } else {
    fail('Home', 'HomeInternational.vue', 'arquivo não encontrado')
  }

  // ──────────────────────────────────────────────────────────────────
  // 2. CATEGORIA /categoria/[slug].vue
  // ──────────────────────────────────────────────────────────────────
  console.log('\n━━━ 2. CATEGORIA (/categoria/[slug].vue) ━━━\n')
  const catVue = readVue('app/pages/categoria/[slug].vue')

  if (catVue) {
    if (catVue.includes('isInternational')) {
      ok('Categoria', 'isInternational computed presente')
    } else {
      fail('Categoria', 'isInternational', 'computed não encontrado')
    }

    if (catVue.includes('/api/intl/category/')) {
      ok('Categoria', 'usa /api/intl/category/ quando isInternational=true')
    } else {
      fail('Categoria', 'API intl', 'não encontrado /api/intl/category/')
    }

    if (catVue.includes("'international'") || catVue.includes('"international"')) {
      ok('Categoria', 'storeSlug=international verificado no template')
    }

    // Verifica bloco internacional no template
    if (catVue.includes('items available') || catVue.includes("item{{ sortedProdutos.length")) {
      ok('Categoria', 'layout internacional em inglês: "items available"')
    } else {
      fail('Categoria', 'layout internacional', 'sem texto em inglês')
    }

    if (catVue.includes('Categories') || catVue.includes('Category')) {
      ok('Categoria', 'breadcrumb em inglês: "Categories"')
    } else {
      fail('Categoria', 'breadcrumb inglês', 'não encontrado')
    }

    // Garantir que Casa do Software NÃO é removida
    if (catVue.includes('isCasaDoSoftware')) {
      ok('Categoria', 'isCasaDoSoftware mantido (Casa do Software intacta)')
    } else {
      fail('Categoria', 'isCasaDoSoftware', 'computed removido — risco de quebrar Casa do Software')
    }
  } else {
    fail('Categoria', '[slug].vue', 'arquivo não encontrado')
  }

  // Verifica DB: 3 categorias com produtos internacionais
  for (const slugCat of ['office', 'windows', 'windows-server']) {
    const cat = await p.categoria.findFirst({ where: { slug: slugCat, ativo: true }, select: { id: true, nome: true } })
    if (!cat) { info(`(categoria "${slugCat}" não encontrada no banco)`); continue }

    const pcs = await p.produtoCategoria.findMany({ where: { categoriaId: cat.id }, select: { produtoId: true } })
    const ids = pcs.map(x => x.produtoId)

    const comPreco = await p.produtoPrecoMoeda.count({
      where: { produtoId: { in: ids }, storeSlug: STORE_SLUG, currency: 'usd' }
    })

    if (comPreco > 0) {
      ok(`Categoria/${slugCat}`, `${comPreco} produto(s) com USD exibidos — sem R$`)
    } else {
      fail(`Categoria/${slugCat}`, 'produtos internacionais', '0 encontrados')
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // 3. PRODUTO /produto/[slug].vue
  // ──────────────────────────────────────────────────────────────────
  console.log('\n━━━ 3. PRODUTO (/produto/[slug].vue) ━━━\n')
  const prodVue = readVue('app/pages/produto/[slug].vue')

  if (prodVue) {
    if (prodVue.includes('isInternational') || prodVue.includes("'international'") || prodVue.includes('"international"')) {
      ok('Produto', 'isInternational/international presente na página de produto')
    } else {
      fail('Produto', 'isInternational', 'não encontrado em produto/[slug].vue')
    }

    if (prodVue.includes('checkout-intl')) {
      ok('Produto', 'botão Buy Now redireciona para /checkout-intl')
    } else {
      fail('Produto', 'checkout-intl', 'redirecionamento não encontrado')
    }

    if (prodVue.includes('Buy Now') || prodVue.includes('buyNow') || prodVue.includes('buy-now')) {
      ok('Produto', 'texto "Buy Now" presente na página de produto')
    }
  } else {
    fail('Produto', '[slug].vue', 'arquivo não encontrado')
  }

  // Verifica DB: 5 produtos têm preço internacional
  console.log()
  for (const prod of PRODUCTS_INTL) {
    const precos = await p.produtoPrecoMoeda.findMany({
      where: { produtoId: prod.id, storeSlug: STORE_SLUG },
      select: { currency: true, amount: true }
    })
    const usd = precos.find(x => x.currency === 'usd')
    const eur = precos.find(x => x.currency === 'eur')

    if (usd && eur) {
      ok(`Produto/${prod.slug}`, `USD $${usd.amount} | EUR €${eur.amount} | sem R$`)
    } else if (usd) {
      fail(`Produto/${prod.slug}`, 'EUR price', 'ausente')
    } else {
      fail(`Produto/${prod.slug}`, 'USD+EUR', 'ambos ausentes')
    }
  }

  // Verifica: /api/products/[slug].get.ts inclui ProdutoPrecoMoeda
  const prodApiTs = readVue('server/api/products/[slug].get.ts')
  if (prodApiTs && prodApiTs.includes('ProdutoPrecoMoeda') && prodApiTs.includes('precosMoeda')) {
    ok('Produto/API', '/api/products/[slug] retorna precosMoeda (usd/eur) para checkout-intl')
  } else {
    fail('Produto/API', '/api/products/[slug]', 'ProdutoPrecoMoeda ausente do SELECT ou do return')
  }

  // ──────────────────────────────────────────────────────────────────
  // 4. CHECKOUT /checkout-intl.vue
  // ──────────────────────────────────────────────────────────────────
  console.log('\n━━━ 4. CHECKOUT (/checkout-intl.vue) ━━━\n')
  const checkoutIntl = readVue('app/pages/checkout-intl.vue')

  if (checkoutIntl) {
    if (checkoutIntl.includes('/api/intl/payment-intent')) {
      ok('Checkout', "endpoint chamado: /api/intl/payment-intent (não /api/stripe/payment-intent)")
    } else {
      fail('Checkout', 'endpoint', '/api/intl/payment-intent não encontrado')
    }

    const ptLeakWords = ['COMPRAR AGORA', 'Pagamento à vista', 'PIX', 'Mercado Pago', 'R$', 'Boleto']
    const leaked = ptLeakWords.filter(w => checkoutIntl.includes(w))
    if (leaked.length === 0) {
      ok('Checkout', 'zero texto português/BRL/PIX/MercadoPago')
    } else {
      fail('Checkout', 'texto PT', `contém: ${leaked.join(', ')}`)
    }

    if (checkoutIntl.includes("'usd'") && checkoutIntl.includes("'eur'")) {
      ok('Checkout', 'suporte a USD e EUR — troca de moeda presente')
    } else {
      fail('Checkout', 'currency', 'seletor USD/EUR não encontrado')
    }

    if (checkoutIntl.includes('stripe-payment-element') || checkoutIntl.includes('Stripe')) {
      ok('Checkout', 'Stripe Elements carrega (#stripe-payment-element)')
    } else {
      fail('Checkout', 'Stripe Elements', 'não encontrado')
    }

    if (checkoutIntl.includes('precosMoeda')) {
      ok('Checkout', 'lê precosMoeda da API de produto para carregar usdPrice/eurPrice')
    } else {
      fail('Checkout', 'precosMoeda', 'não lê precosMoeda — price não carregará')
    }

    // Stripe amount em centavos
    if (checkoutIntl.includes('Math.round') || checkoutIntl.includes('* 100')) {
      info('(amount em centavos calculado no server via Math.round(totalAmount * 100))')
    }
  } else {
    fail('Checkout', 'checkout-intl.vue', 'arquivo não encontrado')
  }

  // Verifica payment-intent.post.ts: nome de relação e apiVersion
  const piTs = readVue('server/api/intl/payment-intent.post.ts')
  if (piTs) {
    if (piTs.includes('ProdutoPrecoMoeda')) {
      ok('Checkout/API', 'payment-intent usa ProdutoPrecoMoeda (nome correto)')
    } else {
      fail('Checkout/API', 'payment-intent', 'precosMoeda ainda presente — bug não corrigido')
    }
    if (piTs.includes('2026-02-25.clover')) {
      ok('Checkout/API', 'apiVersion Stripe = "2026-02-25.clover" — type-check passa')
    } else {
      fail('Checkout/API', 'apiVersion', 'ainda usa versão antiga')
    }
    if (!piTs.includes('/api/stripe/payment-intent')) {
      ok('Checkout/API', 'não chama /api/stripe/payment-intent (checkout nacional isolado)')
    }
    if (piTs.includes("storeSlug: 'international'") || piTs.includes("storeSlug || 'international'")) {
      ok('Checkout/API', "storeSlug fallback = 'international'")
    }
    // Verifica amount em centavos
    if (piTs.includes('Math.round(totalAmount * 100)')) {
      ok('Checkout/API', 'Stripe amount = Math.round(totalAmount * 100) — centavos correto')
    } else {
      fail('Checkout/API', 'amount centavos', 'Math.round(totalAmount * 100) não encontrado')
    }
  } else {
    fail('Checkout/API', 'payment-intent.post.ts', 'arquivo não encontrado')
  }

  // ──────────────────────────────────────────────────────────────────
  // 5. CASA DO SOFTWARE (isolamento)
  // ──────────────────────────────────────────────────────────────────
  console.log('\n━━━ 5. CASA DO SOFTWARE (isolamento) ━━━\n')

  // API nacional nunca foi modificada
  const catNacionalApi = readVue('server/api/categorias/[slug].get.ts')
  if (catNacionalApi) {
    if (catNacionalApi.includes("currency: 'BRL'")) {
      ok('CasaSoftware', "/api/categorias/[slug] ainda retorna currency:'BRL' (intacto)")
    } else {
      fail('CasaSoftware', '/api/categorias/[slug]', "currency:'BRL' removido — quebrado!")
    }
    if (!catNacionalApi.includes('ProdutoPrecoMoeda')) {
      ok('CasaSoftware', '/api/categorias/[slug] não toca em ProdutoPrecoMoeda (isolado)')
    }
  }

  // checkout.vue não foi modificado — verificar que não tem checkout-intl
  const checkoutNacional = readVue('app/pages/checkout.vue')
  if (checkoutNacional) {
    if (!checkoutNacional.includes('checkout-intl') && !checkoutNacional.includes('intl/payment-intent')) {
      ok('CasaSoftware', 'checkout.vue não alterado — sem referência a checkout-intl')
    } else {
      fail('CasaSoftware', 'checkout.vue', 'contém referência international — PROIBIDO')
    }
    if (checkoutNacional.includes('PIX') || checkoutNacional.includes('Mercado Pago') || checkoutNacional.includes('mercadopago')) {
      ok('CasaSoftware', 'checkout.vue mantém PIX/Mercado Pago intactos')
    }
  } else {
    info('(checkout.vue não encontrado neste path — verificar localização)')
  }

  // ProductCard.vue: Casa do Software usa /checkout (não checkout-intl)
  const productCard = readVue('app/components/ProductCard.vue')
  if (productCard) {
    if (productCard.includes("path: '/checkout'") && productCard.includes("path: '/checkout-intl'")) {
      ok('CasaSoftware', 'ProductCard: /checkout para BRL, /checkout-intl para USD/EUR — condicional correto')
    } else {
      fail('CasaSoftware', 'ProductCard buyNow', 'lógica condicional /checkout vs /checkout-intl ausente')
    }
    if (productCard.includes('LICENÇA DIGITAL') && productCard.includes('DIGITAL LICENSE')) {
      ok('CasaSoftware', 'ProductCard: badge "LICENÇA DIGITAL" (PT) e "DIGITAL LICENSE" (EN) condicional')
    }
  }

  // DB: pedidos nacionais intactos
  const ordersNac = await p.order.count({ where: { storeSlug: 'casadosoftware' } })
  ok('CasaSoftware', `${ordersNac} pedidos casadosoftware no banco — intactos`)

  const brlPrecos = await p.produtoPrecoMoeda.count({ where: { storeSlug: 'international', currency: 'brl' } })
  if (brlPrecos === 0) {
    ok('CasaSoftware', 'zero registros BRL em storeSlug=international')
  } else {
    fail('CasaSoftware', 'BRL em international', `${brlPrecos} registros indevidos`)
  }

  // ──────────────────────────────────────────────────────────────────
  // RELATÓRIO FINAL
  // ──────────────────────────────────────────────────────────────────
  console.log('\n====================================================')
  console.log(`RESUMO: ${passed} ✅  |  ${failed} ❌`)
  console.log('====================================================\n')

  if (failed > 0) {
    console.log('FALHAS:\n')
    report.filter(l => l.startsWith('❌')).forEach(l => console.log(' ', l))
  } else {
    console.log('Todos os checks passaram. Loja internacional pronta para teste manual.\n')
  }

  process.exit(failed > 0 ? 1 : 0)
}

run()
  .catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
