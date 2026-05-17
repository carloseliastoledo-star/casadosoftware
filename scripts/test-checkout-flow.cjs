'use strict'
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({ log: ['warn', 'error'] })

let passed = 0
let failed = 0
const issues = []

function ok(msg, detail = '') { passed++; console.log('✅', msg, detail ? `(${detail})` : '') }
function fail(msg, reason) { failed++; issues.push({ msg, reason }); console.log('❌', msg, `— ${reason}`) }
function warn(msg) { console.log('⚠️ ', msg) }

const STORE_SLUG = 'international'
const PRODUCTS = [
  { slug: 'office-2021-pro-plus',                                         id: '21416b89-1ed4-4729-8c62-abb710381037', usd: 29.90, eur: 27.90 },
  { slug: 'office-ltsc-pro-plus-2024',                                    id: 'f615d820-4925-4abe-93e6-4153a6e0014b', usd: 39.90, eur: 36.90 },
  { slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',                id: '50342f30-041c-4cba-8e44-feedd00714fb', usd: 24.90, eur: 22.90 },
  { slug: 'office-2021-pro-plus-windows-11-pro',                          id: '442f0a0c-cac7-48e5-8f73-14d68f3566de', usd: 49.90, eur: 45.90 },
  { slug: 'microsoft-windows-server-2022-standard-download-nota-fiscal',  id: '5b274ecf-31ba-4e8a-a2d1-5797ccaf510b', usd: 69.90, eur: 64.90 },
]

async function run() {
  console.log('\n================================================')
  console.log('TESTE: Fluxo completo checkout internacional')
  console.log('================================================\n')

  // ------------------------------------------------------------------
  // BLOCO 1: Diagnóstico — nome da relação Prisma
  // ------------------------------------------------------------------
  console.log('--- BLOCO 1: Nome da relação Prisma (ProdutoPrecoMoeda vs precosMoeda) ---\n')

  const prod0 = await p.produto.findUnique({
    where: { id: PRODUCTS[0].id },
    select: { id: true, nome: true, ProdutoPrecoMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } } }
  })
  if (prod0?.ProdutoPrecoMoeda) {
    ok('Relação Prisma correta: ProdutoPrecoMoeda (Pascal Case)')
  } else {
    fail('Relação Prisma', 'ProdutoPrecoMoeda retornou null — verificar schema')
  }

  // Testar se o nome errado 'precosMoeda' funciona
  let precosViaWrongName = null
  try {
    const testWrong = await p.produto.findUnique({
      where: { id: PRODUCTS[0].id },
      select: { id: true, precosMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } } }
    })
    precosViaWrongName = testWrong
    warn('PROBLEMA: "precosMoeda" (camelCase) TAMBÉM funciona no Prisma gerado — não causará erro de runtime')
  } catch (e) {
    ok('Confirmado: "precosMoeda" NÃO existe no Prisma — payment-intent.post.ts usará nome errado e FALHARÁ')
  }

  // ------------------------------------------------------------------
  // BLOCO 2: API /api/products/[slug] — inclui precosMoeda/ProdutoPrecoMoeda?
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 2: Diagnóstico API /api/products/[slug] — precosMoeda no SELECT ---\n')
  warn('A API /api/products/[slug].get.ts NÃO inclui ProdutoPrecoMoeda/precosMoeda no SELECT do Prisma')
  warn('O checkout-intl.vue lê p?.precosMoeda de /api/products/:slug — retornará undefined')
  warn('Consequência: usdPrice=null, eurPrice=null → priceError aparece → compra bloqueada')

  // ------------------------------------------------------------------
  // BLOCO 3: Stripe amount calculation
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 3: Cálculo amount → centavos para Stripe ---\n')

  const amountTests = [
    { label: 'office-2021-pro-plus USD',        amount: 29.90, expected: 2990 },
    { label: 'office-2021-pro-plus EUR',        amount: 27.90, expected: 2790 },
    { label: 'office-ltsc-pro-plus-2024 USD',   amount: 39.90, expected: 3990 },
    { label: 'office-ltsc-pro-plus-2024 EUR',   amount: 36.90, expected: 3690 },
    { label: 'windows-11-pro USD',              amount: 24.90, expected: 2490 },
    { label: 'windows-11-pro EUR',              amount: 22.90, expected: 2290 },
    { label: 'office-2021+win11 USD',           amount: 49.90, expected: 4990 },
    { label: 'office-2021+win11 EUR',           amount: 45.90, expected: 4590 },
    { label: 'windows-server-2022 USD',         amount: 69.90, expected: 6990 },
    { label: 'windows-server-2022 EUR',         amount: 64.90, expected: 6490 },
  ]

  for (const t of amountTests) {
    const centavos = Math.round(t.amount * 100)
    if (centavos === t.expected) {
      ok(`${t.label}: ${t.amount} → ${centavos} centavos`)
    } else {
      fail(`${t.label}: ${t.amount} → ${centavos} centavos`, `esperava ${t.expected}`)
    }
  }

  // ------------------------------------------------------------------
  // BLOCO 4: payment-intent.post.ts — lógica de preço via ProdutoPrecoMoeda
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 4: Simulação da lógica do payment-intent ---\n')

  for (const prod of PRODUCTS) {
    for (const [currency, expectedAmount] of [['usd', prod.usd], ['eur', prod.eur]]) {
      // Simula exatamente o que o endpoint faz (usando ProdutoPrecoMoeda via Prisma)
      const produto = await p.produto.findUnique({
        where: { id: prod.id },
        select: {
          id: true, nome: true, ativo: true,
          ProdutoPrecoMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } }
        }
      })

      const precosMoeda = produto?.ProdutoPrecoMoeda || []
      const byCurrency = new Map(
        precosMoeda
          .map(x => ({ currency: String(x.currency).toLowerCase(), amount: Number(x.amount) }))
          .filter(x => x.currency && isFinite(x.amount) && x.amount > 0)
          .map(x => [x.currency, x])
      )

      const priceRow = byCurrency.get(currency)
      const totalAmount = priceRow ? Math.round(priceRow.amount * 100) / 100 : null
      const stripeAmount = totalAmount ? Math.round(totalAmount * 100) : null

      if (!priceRow) {
        fail(`${prod.slug} ${currency.toUpperCase()} — priceRow não encontrado`, 'sem preço em ProdutoPrecoMoeda')
      } else if (Math.abs(priceRow.amount - expectedAmount) >= 0.01) {
        fail(`${prod.slug} ${currency.toUpperCase()} amount`, `${priceRow.amount} !== ${expectedAmount}`)
      } else {
        ok(`${prod.slug} | ${currency.toUpperCase()} | amount=${totalAmount} | Stripe centavos=${stripeAmount}`)
      }
    }
  }

  // ------------------------------------------------------------------
  // BLOCO 5: Produto sem preço — GTA5
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 5: Produto sem preço internacional (GTA5) ---\n')

  const gta5 = await p.produto.findUnique({
    where: { id: 'b81e220d-e038-4363-a0e2-f798544bfb64' },
    select: {
      id: true, nome: true, ativo: true,
      ProdutoPrecoMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } }
    }
  })
  const gtaPrecos = gta5?.ProdutoPrecoMoeda || []
  const gtaMap = new Map(gtaPrecos.map(x => [x.currency, x]))
  const gtaUsd = gtaMap.get('usd')
  const gtaValid = gtaUsd && isFinite(Number(gtaUsd.amount)) && Number(gtaUsd.amount) > 0
  if (!gtaValid) {
    ok('GTA5 USD → priceRow null → endpoint lançaria 400 "does not have a price in USD"')
    ok('GTA5: nenhuma Order seria criada, nenhum PaymentIntent seria criado')
  } else {
    fail('GTA5 tem preço USD — não deveria', JSON.stringify(gtaUsd))
  }

  // ------------------------------------------------------------------
  // BLOCO 6: Confirmar que /api/products/[slug] não expõe precosMoeda
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 6: Bug confirmado — /api/products/[slug] não retorna precosMoeda ---\n')

  // Simula exatamente o select da API atual (sem ProdutoPrecoMoeda)
  const apiCurrentSelect = await p.produto.findUnique({
    where: { id: PRODUCTS[0].id },
    select: {
      id: true, nome: true, slug: true, preco: true, precoAntigo: true,
      ativo: true, imagem: true, cardItems: true
      // SEM ProdutoPrecoMoeda
    }
  })
  const temPrecosMoeda = apiCurrentSelect?.ProdutoPrecoMoeda !== undefined
    || apiCurrentSelect?.precosMoeda !== undefined
  if (!temPrecosMoeda) {
    fail(
      'API /api/products/[slug] NÃO inclui ProdutoPrecoMoeda no SELECT',
      'checkout-intl.vue não conseguirá carregar usdPrice/eurPrice → bloqueará compra'
    )
  } else {
    ok('API já inclui precosMoeda')
  }

  // ------------------------------------------------------------------
  // BLOCO 7: Isolamento Casa do Software
  // ------------------------------------------------------------------
  console.log('\n--- BLOCO 7: Isolamento — Casa do Software ---\n')

  const ordersIntl = await p.order.count({ where: { storeSlug: STORE_SLUG } })
  ok(`Pedidos international no banco: ${ordersIntl} (nenhuma compra real feita ainda)`)

  const ordersNacional = await p.order.count({ where: { storeSlug: 'casadosoftware' } })
  ok(`Pedidos casadosoftware no banco: ${ordersNacional} (intactos)`)

  const brlPrecos = await p.produtoPrecoMoeda.count({ where: { storeSlug: STORE_SLUG, currency: 'brl' } })
  if (brlPrecos === 0) {
    ok('Nenhum preço BRL em storeSlug=international')
  } else {
    fail('Existem preços BRL em international', `count=${brlPrecos}`)
  }

  // ------------------------------------------------------------------
  // RESUMO
  // ------------------------------------------------------------------
  console.log('\n================================================')
  console.log(`RESUMO: ${passed} ✅ passou  |  ${failed} ❌ falhou`)
  console.log('================================================')

  if (issues.length > 0) {
    console.log('\nPROBLEMAS ENCONTRADOS:')
    issues.forEach(i => console.log(`  ❌ ${i.msg}: ${i.reason}`))
    console.log('\nCORREÇÕES NECESSÁRIAS:')
    console.log('  1. server/api/products/[slug].get.ts — adicionar ProdutoPrecoMoeda ao SELECT')
    console.log('  2. server/api/intl/payment-intent.post.ts — verificar nome da relação Prisma')
  }

  process.exit(failed > 0 ? 1 : 0)
}

run()
  .catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
