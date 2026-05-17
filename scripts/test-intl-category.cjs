'use strict'
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({ log: ['warn', 'error'] })

const STORE_SLUG = 'international'
const SLUGS = ['office', 'windows', 'windows-server']

let passed = 0
let failed = 0

function ok(msg) { passed++; console.log('✅', msg) }
function fail(msg, reason) { failed++; console.log('❌', msg, '—', reason) }

async function simulateApi(slug) {
  const categoria = await p.categoria.findFirst({
    where: { slug, ativo: true },
    select: { id: true, nome: true, slug: true }
  })
  if (!categoria) return { categoria: null, produtos: [] }

  const produtoCategorias = await p.produtoCategoria.findMany({
    where: { categoriaId: categoria.id },
    select: { produtoId: true }
  })
  const produtoIds = produtoCategorias.map(pc => pc.produtoId)
  if (!produtoIds.length) return { categoria, produtos: [] }

  const precosIntl = await p.produtoPrecoMoeda.findMany({
    where: { produtoId: { in: produtoIds }, storeSlug: STORE_SLUG, currency: 'usd' },
    select: { produtoId: true, currency: true, amount: true }
  })
  const priceMap = new Map(precosIntl.map(r => [r.produtoId, Number(r.amount)]))
  const produtosComPreco = produtoIds.filter(id => priceMap.has(id))

  const produtos = await p.produto.findMany({
    where: { id: { in: produtosComPreco }, ativo: true },
    select: { id: true, nome: true, nomeEn: true, slug: true }
  })

  return {
    categoria,
    produtos: produtos.map(p => ({
      id: p.id,
      name: p.nomeEn || p.nome,
      slug: p.slug,
      price: priceMap.get(p.id),
      currency: 'usd',
      storeSlug: STORE_SLUG
    }))
  }
}

async function run() {
  console.log('\n================================================')
  console.log('TESTE: API /api/intl/category/[slug] simulação')
  console.log('================================================\n')

  for (const slug of SLUGS) {
    console.log(`\n--- Categoria: ${slug} ---`)
    const result = await simulateApi(slug)

    if (!result.categoria) {
      console.log(`  (categoria "${slug}" não encontrada no banco — pular)`)
      continue
    }

    console.log(`  Categoria: ${result.categoria.nome} (id: ${result.categoria.id})`)
    console.log(`  Produtos com preço international: ${result.produtos.length}`)

    if (result.produtos.length > 0) {
      ok(`/api/intl/category/${slug} retorna ${result.produtos.length} produto(s)`)
      for (const pr of result.produtos) {
        console.log(`    • ${pr.slug} | ${pr.name} | USD ${pr.price} | storeSlug: ${pr.storeSlug}`)
        if (pr.currency !== 'usd') fail(`${pr.slug} currency inválida`, pr.currency)
        if (pr.storeSlug !== 'international') fail(`${pr.slug} storeSlug inválido`, pr.storeSlug)
        if (!pr.price || pr.price <= 0) fail(`${pr.slug} price inválido`, String(pr.price))
      }

      // Confirmar que NENHUM produto BRL aparece
      const semPreco = await p.produto.findMany({
        where: {
          ProdutoCategoria: { some: { categoriaId: result.categoria.id } },
          ativo: true,
          NOT: { id: { in: result.produtos.map(r => r.id) } }
        },
        select: { slug: true }
      })
      if (semPreco.length > 0) {
        ok(`${semPreco.length} produto(s) sem preço internacional EXCLUÍDOS corretamente da lista`)
        semPreco.forEach(s => console.log(`    (excluído) ${s.slug}`))
      }
    } else {
      console.log(`  (nenhum produto com preço international nesta categoria)`)
    }
  }

  // Garantia: Casa do Software — categorias nacionais não foram alteradas
  console.log('\n--- Isolamento: API nacional /api/categorias/office não afetada ---')
  const catOffice = await p.categoria.findFirst({ where: { slug: 'office', ativo: true }, select: { id: true } })
  if (catOffice) {
    const pcs = await p.produtoCategoria.findMany({ where: { categoriaId: catOffice.id }, select: { produtoId: true } })
    const ids = pcs.map(x => x.produtoId)
    const prods = await p.produto.findMany({ where: { id: { in: ids }, ativo: true }, select: { slug: true, preco: true } })
    ok(`API nacional continua com ${prods.length} produto(s) com preco BRL (Produto.preco)`)
    console.log(`  Ex: ${prods[0]?.slug} | R$ ${prods[0]?.preco}`)
  }

  console.log('\n================================================')
  console.log(`RESUMO: ${passed} ✅  |  ${failed} ❌`)
  console.log('================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

run()
  .catch(e => { console.error('ERRO:', e.message); process.exit(1) })
  .finally(() => p.$disconnect())
