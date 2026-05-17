/**
 * Script de diagnóstico - apenas leitura, sem alterar nada
 * Uso: npx tsx scripts/list-products.ts
 */
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

console.log('=== DIAGNÓSTICO INICIADO ===')
console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL)
console.log('Primeiros 40 chars da URL:', String(process.env.DATABASE_URL || '').slice(0, 40) + '...')
console.log('NODE_ENV:', process.env.NODE_ENV || '(não definido)')
console.log('')

const prisma = new PrismaClient({
  log: ['warn', 'error']
})

async function main() {
  console.log('\n==============================')
  console.log('ESTRUTURA: ProdutoPrecoMoeda')
  console.log('==============================')
  console.log('Campos (do schema.prisma):')
  console.log('  id        String   @id')
  console.log('  produtoId String')
  console.log('  storeSlug String')
  console.log('  currency  String')
  console.log('  amount    Float')
  console.log('  oldAmount Float?')
  console.log('  createdAt DateTime')
  console.log('  updatedAt DateTime')
  console.log('  @@unique([produtoId, storeSlug, currency])')

  console.log('\n==============================')
  console.log('TODOS OS PRODUTOS (SELECT id, nome, slug, storeSlug, ativo)')
  console.log('==============================')

  const produtos = await (prisma as any).produto.findMany({
    select: {
      id: true,
      nome: true,
      slug: true,
      storeSlug: true,
      ativo: true,
    },
    orderBy: { nome: 'asc' }
  })

  if (!produtos.length) {
    console.log('Nenhum produto encontrado.')
  } else {
    console.log(`Total: ${produtos.length} produto(s)\n`)
    console.log('| ativo | storeSlug           | slug                          | nome')
    console.log('|-------|---------------------|-------------------------------|-----')
    for (const p of produtos) {
      const ativo = p.ativo ? '  ✅  ' : '  ❌  '
      const store = String(p.storeSlug || '(null)').padEnd(20)
      const slug  = String(p.slug || '').padEnd(30)
      console.log(`|${ativo}| ${store}| ${slug}| ${p.nome}  [id: ${p.id}]`)
    }
  }

  console.log('\n==============================')
  console.log('PREÇOS INTERNACIONAIS EXISTENTES (ProdutoPrecoMoeda)')
  console.log('==============================')

  const precos = await (prisma as any).produtoPrecoMoeda.findMany({
    select: {
      id: true,
      produtoId: true,
      storeSlug: true,
      currency: true,
      amount: true,
      oldAmount: true,
      Produto: { select: { nome: true, slug: true } }
    },
    orderBy: [{ storeSlug: 'asc' }, { currency: 'asc' }]
  })

  if (!precos.length) {
    console.log('Nenhum preço em moeda estrangeira cadastrado ainda.')
  } else {
    console.log(`Total: ${precos.length} registro(s)\n`)
    console.log('| storeSlug           | currency | amount   | oldAmount | slug produto')
    console.log('|---------------------|----------|----------|-----------|-------------')
    for (const p of precos) {
      const store    = String(p.storeSlug || '').padEnd(20)
      const currency = String(p.currency || '').padEnd(8)
      const amount   = String(Number(p.amount).toFixed(2)).padEnd(8)
      const old      = p.oldAmount ? String(Number(p.oldAmount).toFixed(2)).padEnd(9) : '(null)   '
      const slug     = String(p.Produto?.slug || p.produtoId)
      console.log(`| ${store}| ${currency}| ${amount}| ${old}| ${slug}`)
    }
  }

  console.log('\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
