/**
 * test-intl-db.cjs — Testes de lógica de negócio via Prisma direto
 * Valida o que o checkout-intl fará sem precisar do servidor HTTP
 * node scripts/test-intl-db.cjs
 */
'use strict'

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({ log: ['warn', 'error'] })

let passed = 0
let failed = 0

function ok(name, detail = '') {
  passed++
  console.log('✅', name, detail ? `(${detail})` : '')
}

function fail(name, reason) {
  failed++
  console.log('❌', name, `— ERRO: ${reason}`)
}

async function test(name, fn) {
  try {
    await fn()
    ok(name)
  } catch (e) {
    fail(name, e.message)
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function run() {
  console.log('\n================================================')
  console.log('TESTES DE LÓGICA — LOJA INTERNACIONAL')
  console.log('================================================\n')

  // -----------------------------------------------------------
  // BLOCO 1: Os 5 produtos têm preços USD e EUR em international
  // -----------------------------------------------------------
  console.log('--- BLOCO 1: ProdutoPrecoMoeda storeSlug=international ---\n')

  const expected = [
    { slug: 'office-2021-pro-plus',                                        usd: 29.90, eur: 27.90, id: '21416b89-1ed4-4729-8c62-abb710381037' },
    { slug: 'office-ltsc-pro-plus-2024',                                   usd: 39.90, eur: 36.90, id: 'f615d820-4925-4abe-93e6-4153a6e0014b' },
    { slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',               usd: 24.90, eur: 22.90, id: '50342f30-041c-4cba-8e44-feedd00714fb' },
    { slug: 'office-2021-pro-plus-windows-11-pro',                         usd: 49.90, eur: 45.90, id: '442f0a0c-cac7-48e5-8f73-14d68f3566de' },
    { slug: 'microsoft-windows-server-2022-standard-download-nota-fiscal', usd: 69.90, eur: 64.90, id: '5b274ecf-31ba-4e8a-a2d1-5797ccaf510b' },
  ]

  for (const prod of expected) {
    await test(`${prod.slug} — existe em ProdutoPrecoMoeda USD international`, async () => {
      const row = await p.produtoPrecoMoeda.findFirst({
        where: { produtoId: prod.id, storeSlug: 'international', currency: 'usd' }
      })
      assert(row, 'registro USD não encontrado')
      assert(Math.abs(Number(row.amount) - prod.usd) < 0.01, `amount ${row.amount} !== ${prod.usd}`)
    })

    await test(`${prod.slug} — existe em ProdutoPrecoMoeda EUR international`, async () => {
      const row = await p.produtoPrecoMoeda.findFirst({
        where: { produtoId: prod.id, storeSlug: 'international', currency: 'eur' }
      })
      assert(row, 'registro EUR não encontrado')
      assert(Math.abs(Number(row.amount) - prod.eur) < 0.01, `amount ${row.amount} !== ${prod.eur}`)
    })

    await test(`${prod.slug} — produto ativo`, async () => {
      const prod_db = await p.produto.findUnique({ where: { id: prod.id }, select: { ativo: true } })
      assert(prod_db?.ativo === true, 'produto inativo ou não encontrado')
    })
  }

  // -----------------------------------------------------------
  // BLOCO 2: Produto fora da lista NÃO tem preço international
  // -----------------------------------------------------------
  console.log('\n--- BLOCO 2: Produto sem preço internacional ---\n')

  const semPreco = [
    { slug: 'gta5',       id: 'b81e220d-e038-4363-a0e2-f798544bfb64' },
    { slug: 'mortalkombat', id: '9741402f-b46a-40d6-a718-bdf34e814a91' },
  ]

  for (const prod of semPreco) {
    await test(`${prod.slug} — NÃO tem preço USD international (bloquearia compra)`, async () => {
      const row = await p.produtoPrecoMoeda.findFirst({
        where: { produtoId: prod.id, storeSlug: 'international', currency: 'usd' }
      })
      assert(!row, `encontrou preço USD international inesperado: ${JSON.stringify(row)}`)
    })

    await test(`${prod.slug} — NÃO tem preço EUR international (bloquearia compra)`, async () => {
      const row = await p.produtoPrecoMoeda.findFirst({
        where: { produtoId: prod.id, storeSlug: 'international', currency: 'eur' }
      })
      assert(!row, `encontrou preço EUR international inesperado: ${JSON.stringify(row)}`)
    })
  }

  // -----------------------------------------------------------
  // BLOCO 3: Preços BRL da Casa do Software NÃO foram alterados
  // -----------------------------------------------------------
  console.log('\n--- BLOCO 3: Integridade — preços BRL e Casa do Software ---\n')

  await test('Nenhum registro international com currency=brl', async () => {
    const rows = await p.produtoPrecoMoeda.findMany({
      where: { storeSlug: 'international', currency: 'brl' }
    })
    assert(rows.length === 0, `encontrou ${rows.length} registros BRL em international: ${JSON.stringify(rows)}`)
  })

  await test('Total exato de 10 registros em ProdutoPrecoMoeda storeSlug=international', async () => {
    const total = await p.produtoPrecoMoeda.count({ where: { storeSlug: 'international' } })
    assert(total === 10, `esperava 10, encontrou ${total}`)
  })

  await test('ProdutoPrecoLoja da Casa do Software não foi alterado (ainda existe)', async () => {
    const rows = await p.produtoPrecoLoja.findMany({
      where: { storeSlug: 'casadosoftware' },
      select: { storeSlug: true, preco: true },
      take: 1
    })
    assert(rows.length > 0, 'nenhum registro casadosoftware em ProdutoPrecoLoja — possível corrupção!')
  })

  await test('Nenhum pedido com storeSlug=international (nenhuma compra feita ainda)', async () => {
    const orders = await p.order.count({ where: { storeSlug: 'international' } })
    assert(orders === 0, `encontrou ${orders} pedido(s) international inesperado(s)`)
  })

  // -----------------------------------------------------------
  // BLOCO 4: Lógica do checkout — simulação da busca de preço
  // -----------------------------------------------------------
  console.log('\n--- BLOCO 4: Simulação da lógica do checkout ---\n')

  for (const prod of expected) {
    await test(`checkout-intl: busca USD para ${prod.slug} retorna amount correto`, async () => {
      const produto = await p.produto.findUnique({
        where: { id: prod.id },
        select: {
          id: true, nome: true, ativo: true,
          ProdutoPrecoMoeda: { where: { storeSlug: 'international' }, select: { currency: true, amount: true } }
        }
      })
      assert(produto?.ativo, 'produto inativo')
      const byCurrency = new Map(produto.ProdutoPrecoMoeda.map(x => [x.currency, x]))
      const usd = byCurrency.get('usd')
      assert(usd && Number(usd.amount) > 0, `sem USD ou amount inválido: ${JSON.stringify(usd)}`)
      assert(Math.abs(Number(usd.amount) - prod.usd) < 0.01, `USD ${usd.amount} !== ${prod.usd}`)
    })

    await test(`checkout-intl: busca EUR para ${prod.slug} retorna amount correto`, async () => {
      const produto = await p.produto.findUnique({
        where: { id: prod.id },
        select: {
          id: true, nome: true, ativo: true,
          ProdutoPrecoMoeda: { where: { storeSlug: 'international' }, select: { currency: true, amount: true } }
        }
      })
      const byCurrency = new Map(produto.ProdutoPrecoMoeda.map(x => [x.currency, x]))
      const eur = byCurrency.get('eur')
      assert(eur && Number(eur.amount) > 0, `sem EUR ou amount inválido: ${JSON.stringify(eur)}`)
      assert(Math.abs(Number(eur.amount) - prod.eur) < 0.01, `EUR ${eur.amount} !== ${prod.eur}`)
    })
  }

  // Produto sem preço: simula que checkout bloquearia
  await test('checkout-intl: GTA5 sem preço USD → bloquearia com 400', async () => {
    const gtaId = 'b81e220d-e038-4363-a0e2-f798544bfb64'
    const produto = await p.produto.findUnique({
      where: { id: gtaId },
      select: { ProdutoPrecoMoeda: { where: { storeSlug: 'international' }, select: { currency: true, amount: true } } }
    })
    const byCurrency = new Map((produto?.ProdutoPrecoMoeda || []).map(x => [x.currency, x]))
    const usd = byCurrency.get('usd')
    const valid = usd && Number.isFinite(Number(usd.amount)) && Number(usd.amount) > 0
    assert(!valid, 'GTA5 tem preço USD international — não deveria!')
    // Confirma que o checkout lançaria erro 400
    ok('→ checkout lançaria statusCode 400 "does not have a price in USD"')
  })

  // -----------------------------------------------------------
  // RESUMO
  // -----------------------------------------------------------
  console.log('\n================================================')
  console.log(`RESUMO FINAL: ${passed} ✅ passou  |  ${failed} ❌ falhou`)
  console.log('================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

run()
  .catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
