import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generateEnglishSlug(nome: string, nomeEn: string | null): string {
  if (nomeEn) {
    return slugify(nomeEn)
  }
  const translations: Record<string, string> = {
    'licenca': 'license',
    'digital': 'digital',
    'microsoft': 'microsoft',
    'windows': 'windows',
    'office': 'office',
    'professional': 'professional',
    'plus': 'plus',
    'personal': 'personal',
    'home': 'home',
    'business': 'business',
    'pro': 'pro',
    '1tb': '1tb',
    '1-licenca': '1-license',
    '1-license': '1-license',
    'atualizacao': 'update',
    'update': 'update',
    'mac': 'mac',
    'pc': 'pc'
  }
  
  let slug = slugify(nome)
  for (const [pt, en] of Object.entries(translations)) {
    slug = slug.replace(new RegExp(pt, 'gi'), en)
  }
  return slug
}

async function main() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      slug: true,
      nomeEn: true
    },
    orderBy: { nome: 'asc' }
  })

  let csv = 'Produto,URL atual em português,Nova URL em inglês,Status do redirect\n'
  
  for (const produto of produtos) {
    const currentUrl = `/produto/${produto.slug}`
    const newSlug = generateEnglishSlug(produto.nome, produto.nomeEn)
    const newUrl = `/product/${newSlug}`
    csv += `${produto.nome},${currentUrl},${newUrl},301\n`
  }

  writeFileSync('scripts/slug-mapping.csv', csv, 'utf-8')
  console.log('CSV gerado: scripts/slug-mapping.csv')
  console.log(`Total de produtos: ${produtos.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
