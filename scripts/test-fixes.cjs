'use strict'
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({ log: ['warn', 'error'] })

let passed = 0
let failed = 0

function ok(msg) { passed++; console.log('✅', msg) }
function fail(msg, reason) { failed++; console.log('❌', msg, `— ${reason}`) }

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
  console.log('VALIDAÇÃO DOS FIXES — BUG1 + BUG2')
  console.log('================================================\n')

  // ------------------------------------------------------------------
  // FIX BUG1: /api/products/[slug] agora inclui ProdutoPrecoMoeda
  // Simula exatamente o novo SELECT com ProdutoPrecoMoeda
  // ------------------------------------------------------------------
  console.log('--- FIX BUG1: /api/products/[slug] — ProdutoPrecoMoeda no SELECT ---\n')

  for (const prod of PRODUCTS) {
    const produto = await p.produto.findUnique({
      where: { slug: prod.slug },
      select: {
        id: true, nome: true, slug: true, preco: true, precoAntigo: true,
        ativo: true, imagem: true, cardItems: true,
        ProdutoPrecoMoeda: { select: { storeSlug: true, currency: true, amount: true } }
      }
    })

    // Simula o mapeamento que agora está no return da API
    const precosMoeda = (produto?.ProdutoPrecoMoeda || []).map(x => ({
      storeSlug: x.storeSlug,
      currency: String(x.currency || '').toLowerCase(),
      amount: Number(x.amount)
    }))

    // checkout-intl.vue lê: p?.precosMoeda?.find(x => x.currency === 'usd')
    const usdPriceMoeda = precosMoeda.find(x => x.currency === 'usd' && x.storeSlug === STORE_SLUG)
    const eurPriceMoeda = precosMoeda.find(x => x.currency === 'eur' && x.storeSlug === STORE_SLUG)

    if (!usdPriceMoeda) {
      fail(`${prod.slug} — usdPrice`, 'precosMoeda.find(usd) retornou undefined')
    } else if (Math.abs(usdPriceMoeda.amount - prod.usd) >= 0.01) {
      fail(`${prod.slug} — usdPrice amount`, `${usdPriceMoeda.amount} !== ${prod.usd}`)
    } else {
      ok(`${prod.slug} | usdPrice = ${usdPriceMoeda.amount} ✓ | checkout-intl carregará $${prod.usd}`)
    }

    if (!eurPriceMoeda) {
      fail(`${prod.slug} — eurPrice`, 'precosMoeda.find(eur) retornou undefined')
    } else if (Math.abs(eurPriceMoeda.amount - prod.eur) >= 0.01) {
      fail(`${prod.slug} — eurPrice amount`, `${eurPriceMoeda.amount} !== ${prod.eur}`)
    } else {
      ok(`${prod.slug} | eurPrice = ${eurPriceMoeda.amount} ✓ | troca para EUR mostrará €${prod.eur}`)
    }
  }

  // ------------------------------------------------------------------
  // FIX BUG2: payment-intent.post.ts — ProdutoPrecoMoeda no Prisma
  // Simula exatamente o select corrigido dentro da transação
  // ------------------------------------------------------------------
  console.log('\n--- FIX BUG2: payment-intent.post.ts — ProdutoPrecoMoeda correto ---\n')

  for (const prod of PRODUCTS) {
    for (const [currency, expectedAmount, expectedCentavos] of [
      ['usd', prod.usd, Math.round(prod.usd * 100)],
      ['eur', prod.eur, Math.round(prod.eur * 100)],
    ]) {
      const produto = await p.produto.findUnique({
        where: { id: prod.id },
        select: {
          id: true, nome: true, ativo: true,
          ProdutoPrecoMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } }
        }
      })

      const byCurrency = new Map(
        (produto?.ProdutoPrecoMoeda || [])
          .map(x => ({ currency: String(x.currency).toLowerCase(), amount: Number(x.amount) }))
          .filter(x => x.currency && isFinite(x.amount) && x.amount > 0)
          .map(x => [x.currency, x])
      )

      const priceRow = byCurrency.get(currency)
      if (!priceRow) {
        fail(`${prod.slug} ${currency.toUpperCase()} priceRow`, 'null — endpoint lançaria 400')
        continue
      }

      const totalAmount = Math.round(priceRow.amount * 100) / 100
      const stripeAmount = Math.round(totalAmount * 100)

      if (Math.abs(totalAmount - expectedAmount) >= 0.01) {
        fail(`${prod.slug} ${currency.toUpperCase()} totalAmount`, `${totalAmount} !== ${expectedAmount}`)
      } else if (stripeAmount !== expectedCentavos) {
        fail(`${prod.slug} ${currency.toUpperCase()} stripeAmount`, `${stripeAmount} !== ${expectedCentavos}`)
      } else {
        ok(`${prod.slug} | ${currency.toUpperCase()} | totalAmount=${totalAmount} | Stripe=${stripeAmount} centavos`)
      }
    }
  }

  // ------------------------------------------------------------------
  // FIX BUG2: Produto sem preço — lançaria 400
  // ------------------------------------------------------------------
  console.log('\n--- Produto sem preço (GTA5) — payment-intent retornaria 400 ---\n')

  const gta5 = await p.produto.findUnique({
    where: { id: 'b81e220d-e038-4363-a0e2-f798544bfb64' },
    select: {
      id: true, ativo: true,
      ProdutoPrecoMoeda: { where: { storeSlug: STORE_SLUG }, select: { currency: true, amount: true } }
    }
  })
  const gtaMap = new Map((gta5?.ProdutoPrecoMoeda || []).map(x => [x.currency, x]))
  const gtaUsd = gtaMap.get('usd')
  if (!gtaUsd) {
    ok('GTA5: priceRow=null → endpoint lança 400 "does not have a price in USD" → sem Order, sem PaymentIntent')
  } else {
    fail('GTA5 tem preço USD', JSON.stringify(gtaUsd))
  }

  // ------------------------------------------------------------------
  // RESUMO FINAL
  // ------------------------------------------------------------------
  console.log('\n================================================')
  console.log(`RESUMO: ${passed} ✅ passou  |  ${failed} ❌ falhou`)
  console.log('================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

run()
  .catch(e => { console.error('ERRO:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
