/**
 * SEED: Preços internacionais (storeSlug='international')
 * APENAS INSERT/UPSERT em ProdutoPrecoMoeda.
 * Não altera: Produto, ProdutoPrecoLoja, preços BRL, Casa do Software.
 *
 * DRY-RUN por padrão. Para executar de verdade: DRY_RUN=false npx tsx scripts/seed-international-prices.ts
 */
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { randomUUID } from 'node:crypto'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const DRY_RUN = process.env.DRY_RUN !== 'false'

console.log('=== SEED PREÇOS INTERNACIONAIS ===')
console.log('DRY_RUN:', DRY_RUN, DRY_RUN ? '(apenas simulação — nada será gravado)' : '*** MODO REAL — GRAVANDO NO BANCO ***')
console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL)
console.log('')

const STORE_SLUG = 'international'

const PRICES: Array<{
  produtoId: string
  slug: string
  nome: string
  usd: number
  eur: number
}> = [
  {
    produtoId: '21416b89-1ed4-4729-8c62-abb710381037',
    slug: 'office-2021-pro-plus',
    nome: 'Office 2021 Professional Plus – Licença Digital',
    usd: 29.90,
    eur: 27.90,
  },
  {
    produtoId: 'f615d820-4925-4abe-93e6-4153a6e0014b',
    slug: 'office-ltsc-pro-plus-2024',
    nome: 'Office 2024 Professional – Licença Digital',
    usd: 39.90,
    eur: 36.90,
  },
  {
    produtoId: '50342f30-041c-4cba-8e44-feedd00714fb',
    slug: 'microsoft-windows-11-pro-chave-esd-32-64-bits',
    nome: 'Windows 11 Pro – Licença Digital com Ativação Online',
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
    nome: 'MICROSOFT WINDOWS SERVER 2022 STANDARD',
    usd: 69.90,
    eur: 64.90,
  },
]

const prisma = new PrismaClient({ log: ['warn', 'error'] })

async function main() {
  const now = new Date()

  for (const produto of PRICES) {
    for (const [currency, amount] of [['usd', produto.usd], ['eur', produto.eur]] as const) {
      const existing = await (prisma as any).produtoPrecoMoeda.findFirst({
        where: {
          produtoId: produto.produtoId,
          storeSlug: STORE_SLUG,
          currency,
        },
        select: { id: true, amount: true }
      })

      if (existing) {
        console.log(`[UPDATE] ${produto.slug} | ${currency.toUpperCase()} | ${existing.amount} → ${amount} | id: ${existing.id}`)
        if (!DRY_RUN) {
          await (prisma as any).produtoPrecoMoeda.update({
            where: { id: existing.id },
            data: { amount, updatedAt: now }
          })
          console.log(`  ✅ Atualizado`)
        } else {
          console.log(`  (dry-run — não executado)`)
        }
      } else {
        const newId = randomUUID()
        console.log(`[INSERT] ${produto.slug} | ${currency.toUpperCase()} | ${amount} | novo id: ${newId}`)
        if (!DRY_RUN) {
          await (prisma as any).produtoPrecoMoeda.create({
            data: {
              id: newId,
              produtoId: produto.produtoId,
              storeSlug: STORE_SLUG,
              currency,
              amount,
              oldAmount: null,
              createdAt: now,
              updatedAt: now,
            }
          })
          console.log(`  ✅ Inserido`)
        } else {
          console.log(`  (dry-run — não executado)`)
        }
      }
    }
  }

  console.log('\n=== CONCLUÍDO ===')
  if (DRY_RUN) {
    console.log('Nada foi gravado. Para executar de verdade:')
    console.log('  DRY_RUN=false npx tsx scripts/seed-international-prices.ts')
  }
}

main()
  .catch((e) => { console.error('ERRO FATAL:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
