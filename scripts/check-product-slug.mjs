/**
 * Check if a product exists in the database
 * Usage: DATABASE_URL=<url> SLUG=<slug> node scripts/check-product-slug.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const slug = process.env.SLUG || 'microsoft-office-365-vitalicio-5-licencas-pc-mac-android-ou-ios-1-tb-one-drive'

async function main() {
  console.log('🔍 Checking slug:', slug)
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':****@'))

  // Try to find by slug with casadosoftware storeSlug
  const produto = await prisma.produto.findFirst({
    where: {
      slug,
      storeSlug: 'casadosoftware'
    }
  })

  if (produto) {
    console.log('✅ Found product with storeSlug=casadosoftware')
    console.log('  - id:', produto.id)
    console.log('  - nome:', produto.nome)
    console.log('  - ativo:', produto.ativo)
    console.log('  - storeSlug:', produto.storeSlug)
    await prisma.$disconnect()
    return
  }

  console.log('❌ Not found with storeSlug=casadosoftware')
  
  // Try to find with null storeSlug (old products)
  const produtoNull = await prisma.produto.findFirst({
    where: {
      slug,
      storeSlug: null
    }
  })

  if (produtoNull) {
    console.log('⚠️  Found product with storeSlug=null (old product)')
    console.log('  - id:', produtoNull.id)
    console.log('  - nome:', produtoNull.nome)
    console.log('  - ativo:', produtoNull.ativo)
    await prisma.$disconnect()
    return
  }

  console.log('❌ Product not found at all')
  
  // Try to find any Office 365 products as alternatives
  const office365 = await prisma.produto.findMany({
    where: {
      slug: {
        contains: 'office-365'
      },
      OR: [
        { storeSlug: 'casadosoftware' },
        { storeSlug: null }
      ]
    },
    take: 10,
    select: { id: true, slug: true, nome: true, ativo: true, storeSlug: true }
  })

  if (office365.length > 0) {
    console.log('💡 Found Office 365 alternatives:')
    office365.forEach(p => {
      console.log(`  - ${p.slug}: ${p.nome} (ativo: ${p.ativo}, storeSlug: ${p.storeSlug})`)
    })
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
