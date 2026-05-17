'use strict'
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient({ log: ['warn', 'error'] })

p.produtoPrecoMoeda.findMany({
  where: { storeSlug: 'international' },
  select: {
    storeSlug: true,
    currency: true,
    amount: true,
    Produto: { select: { slug: true, nome: true } }
  },
  orderBy: [{ Produto: { nome: 'asc' } }, { currency: 'asc' }]
}).then(rows => {
  console.log('Total registros international:', rows.length)
  console.log('')
  console.log('slug | nome | storeSlug | currency | amount')
  console.log('-----|------|-----------|----------|-------')
  rows.forEach(r => {
    console.log(
      r.Produto.slug + ' | ' +
      r.Produto.nome + ' | ' +
      r.storeSlug + ' | ' +
      r.currency.toUpperCase() + ' | ' +
      Number(r.amount).toFixed(2)
    )
  })
}).catch(e => {
  console.error('ERRO:', e.message)
  process.exit(1)
}).finally(() => p.$disconnect())
