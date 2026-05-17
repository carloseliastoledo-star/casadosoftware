/**
 * seed-intl.js — Preços internacionais (storeSlug='international')
 * Apenas INSERT/UPDATE em ProdutoPrecoMoeda
 * Não altera: Produto, ProdutoPrecoLoja, preços BRL
 *
 * DRY_RUN=true  node scripts/seed-intl.js   → simulação
 * DRY_RUN=false node scripts/seed-intl.js   → executa de verdade
 */
'use strict'

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('node:crypto')

const DRY_RUN = process.env.DRY_RUN !== 'false'

console.log('=========================================')
console.log('SEED: Precos internacionais')
console.log('DRY_RUN:', DRY_RUN)
if (DRY_RUN) {
  console.log('MODO SIMULACAO — nenhuma alteracao sera gravada')
} else {
  console.log('*** MODO REAL — GRAVANDO NO BANCO ***')
}
console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL)
console.log('=========================================\n')

const STORE_SLUG = 'international'

const PRICES = [
  {
    produtoId: '21416b89-1ed4-4729-8c62-abb710381037',
    slug: 'office-2021-pro-plus',
    nome: 'Office 2021 Professional Plus',
    usd: 29.90,
    eur: 27.90,
  },
  {
    produtoId: 'f615d820-4925-4abe-93e6-4153a6e0014b',
    slug: 'office-ltsc-pro-plus-2024',
    nome: 'Office 2024 Professional',
    usd: 39.90,
    eur: 36.90,
  },
  {
    produtoId: '50342f30-041c-4cba-8e44-feedd00714fb',
    slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',
    nome: 'Windows 11 Pro – Licenca Digital',
    usd: 24.90,
    eur: 22.90,
  },
  {
    produtoId: '442f0a0c-cac7-48e5-8f73-14d68f3566de',
    slug: 'office-2021-pro-plus-windows-11-pro',
    nome: 'Office 2021 Pro Plus + Windows 11 Pro',
    usd: 49.90,
    eur: 45.90,
  },
  {
    produtoId: '5b274ecf-31ba-4e8a-a2d1-5797ccaf510b',
    slug: 'microsoft-windows-server-2022-standard-download-nota-fiscal',
    nome: 'Windows Server 2022 Standard',
    usd: 69.90,
    eur: 64.90,
  },
]

const prisma = new PrismaClient({ log: ['warn', 'error'] })

async function main() {
  const now = new Date()
  let totalInsert = 0
  let totalUpdate = 0

  for (const prod of PRICES) {
    for (const [currency, amount] of [['usd', prod.usd], ['eur', prod.eur]]) {
      const existing = await prisma.produtoPrecoMoeda.findFirst({
        where: { produtoId: prod.produtoId, storeSlug: STORE_SLUG, currency },
        select: { id: true, amount: true }
      })

      const row = {
        produtoId: prod.produtoId,
        slug: prod.slug,
        nome: prod.nome,
        storeSlug: STORE_SLUG,
        currency: currency.toUpperCase(),
        amount,
      }

      if (existing) {
        totalUpdate++
        console.log('[SERIA UPDATE]')
        console.log('  id         :', existing.id)
        console.log('  produtoId  :', row.produtoId)
        console.log('  slug       :', row.slug)
        console.log('  nome       :', row.nome)
        console.log('  storeSlug  :', row.storeSlug)
        console.log('  currency   :', row.currency)
        console.log('  amount     :', existing.amount, '->', row.amount)
        if (!DRY_RUN) {
          await prisma.produtoPrecoMoeda.update({
            where: { id: existing.id },
            data: { amount, updatedAt: now }
          })
          console.log('  => ATUALIZADO')
        } else {
          console.log('  => (simulacao)')
        }
        console.log()
      } else {
        totalInsert++
        const newId = randomUUID()
        console.log('[SERIA INSERT]')
        console.log('  novo id    :', newId)
        console.log('  produtoId  :', row.produtoId)
        console.log('  slug       :', row.slug)
        console.log('  nome       :', row.nome)
        console.log('  storeSlug  :', row.storeSlug)
        console.log('  currency   :', row.currency)
        console.log('  amount     :', row.amount)
        if (!DRY_RUN) {
          await prisma.produtoPrecoMoeda.create({
            data: {
              id: newId,
              produtoId: prod.produtoId,
              storeSlug: STORE_SLUG,
              currency,
              amount,
              oldAmount: null,
              createdAt: now,
              updatedAt: now,
            }
          })
          console.log('  => INSERIDO')
        } else {
          console.log('  => (simulacao)')
        }
        console.log()
      }
    }
  }

  console.log('=========================================')
  console.log('RESUMO')
  console.log('  Registros que seriam INSERIDOS :', totalInsert)
  console.log('  Registros que seriam ATUALIZADOS:', totalUpdate)
  console.log('  Total de operacoes             :', totalInsert + totalUpdate)
  if (DRY_RUN) {
    console.log('\nNADA FOI GRAVADO (DRY_RUN=true)')
    console.log('Para executar de verdade:')
    console.log('  DRY_RUN=false node scripts/seed-intl.js')
  } else {
    console.log('\nTODAS AS OPERACOES FORAM GRAVADAS NO BANCO')
  }
  console.log('=========================================')
}

main()
  .catch((e) => { console.error('ERRO FATAL:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
