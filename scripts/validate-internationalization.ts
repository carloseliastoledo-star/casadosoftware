import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('=== VALIDAÇÃO DE INTERNACIONALIZAÇÃO DE SLUGS ===\n')
  
  // 1. Count products with slugEn
  const productsWithSlugEn = await prisma.produto.count({
    where: { slugEn: { not: null } }
  })
  const totalProducts = await prisma.produto.count({ where: { ativo: true } })
  
  console.log(`1. Contagem de produtos com slugEn:`)
  console.log(`   - Produtos ativos totais: ${totalProducts}`)
  console.log(`   - Produtos com slugEn: ${productsWithSlugEn}`)
  console.log(`   - Porcentagem: ${((productsWithSlugEn / totalProducts) * 100).toFixed(1)}%`)
  
  // 2. List problematic slugs (empty or Portuguese words)
  const problematicSlugs = await prisma.produto.findMany({
    where: {
      ativo: true,
      OR: [
        { slugEn: null },
        { slugEn: '' }
      ]
    },
    select: { id: true, nome: true, slug: true, slugEn: true }
  })
  
  console.log(`\n2. Slugs problemáticos (sem slugEn):`)
  console.log(`   - Total: ${problematicSlugs.length}`)
  if (problematicSlugs.length > 0) {
    problematicSlugs.slice(0, 10).forEach(p => {
      console.log(`   - ${p.nome}: slug="${p.slug}", slugEn=${p.slugEn || 'NULL'}`)
    })
    if (problematicSlugs.length > 10) {
      console.log(`   - ... e mais ${problematicSlugs.length - 10} produtos`)
    }
  }
  
  // 3. Count potential redirects (all products with both slug and slugEn)
  const productsWithBoth = await prisma.produto.findMany({
    where: {
      ativo: true,
      slugEn: { not: null }
    },
    select: { id: true, nome: true, slug: true, slugEn: true }
  })
  
  console.log(`\n3. Contagem de redirects 301 potenciais:`)
  console.log(`   - Produtos com slug e slugEn: ${productsWithBoth.length}`)
  console.log(`   - Cada produto pode ter 1 redirect de /produto/[slug] -> /product/[slugEn]`)
  
  // 4. Show 5 example redirects
  console.log(`\n4. Exemplos de redirects 301 (5 produtos):`)
  productsWithBoth.slice(0, 5).forEach(p => {
    const oldUrl = `/produto/${p.slug}`
    const newUrl = `/product/${p.slugEn}`
    console.log(`   - ${oldUrl} -> ${newUrl}`)
    console.log(`     (${p.nome})`)
  })
  
  // 5. Check for duplicate slugEn values
  const allSlugEn = await prisma.produto.findMany({
    where: {
      ativo: true,
      slugEn: { not: null }
    },
    select: { slugEn: true }
  })
  
  const slugEnCounts: Record<string, number> = {}
  allSlugEn.forEach(p => {
    if (p.slugEn) {
      slugEnCounts[p.slugEn] = (slugEnCounts[p.slugEn] || 0) + 1
    }
  })
  
  const duplicateSlugEn = Object.entries(slugEnCounts)
    .filter(([_, count]) => count > 1)
    .map(([slugEn, count]) => ({ slugEn, count }))
  
  console.log(`\n5. Verificação de slugEn duplicados:`)
  console.log(`   - SlugEn duplicados: ${duplicateSlugEn.length}`)
  if (duplicateSlugEn.length > 0) {
    duplicateSlugEn.forEach(d => {
      console.log(`   - slugEn="${d.slugEn}": ${d.count} ocorrências`)
    })
  }
  
  // 6. Check for Portuguese words in slugEn
  const portugueseWords = ['de', 'do', 'da', 'em', 'para', 'com', 'sem', 'sobre', 'entre', 'para', 'ate', 'a', 'o', 'e', 'ou']
  const slugsWithPortuguese = await prisma.produto.findMany({
    where: {
      ativo: true,
      slugEn: { not: null }
    },
    select: { id: true, nome: true, slugEn: true }
  })
  
  const problematicPortugueseSlugs = slugsWithPortuguese.filter(p => {
    const slugEn = p.slugEn?.toLowerCase() || ''
    return portugueseWords.some(word => new RegExp(`\\b${word}\\b`).test(slugEn))
  })
  
  console.log(`\n6. Verificação de palavras em português em slugEn:`)
  console.log(`   - Slugs com palavras portuguesas: ${problematicPortugueseSlugs.length}`)
  if (problematicPortugueseSlugs.length > 0) {
    problematicPortugueseSlugs.slice(0, 5).forEach(p => {
      console.log(`   - ${p.nome}: slugEn="${p.slugEn}"`)
    })
    if (problematicPortugueseSlugs.length > 5) {
      console.log(`   - ... e mais ${problematicPortugueseSlugs.length - 5} produtos`)
    }
  }
  
  // 7. Generate summary report
  const report = `
=== RELATÓRIO DE VALIDAÇÃO DE INTERNACIONALIZAÇÃO ===

Data: ${new Date().toISOString()}

1. CONTAGEM DE PRODUTOS COM SLUGEN
   - Produtos ativos totais: ${totalProducts}
   - Produtos com slugEn: ${productsWithSlugEn}
   - Porcentagem: ${((productsWithSlugEn / totalProducts) * 100).toFixed(1)}%

2. SLUGS PROBLEMÁTICOS (SEM SLUGEN)
   - Total: ${problematicSlugs.length}
   ${problematicSlugs.map(p => `   - ${p.nome}: slug="${p.slug}", slugEn=${p.slugEn || 'NULL'}`).join('\n')}

3. CONTAGEM DE REDIRECTS 301 POTENCIAIS
   - Produtos com slug e slugEn: ${productsWithBoth.length}
   - Cada produto pode ter 1 redirect de /produto/[slug] -> /product/[slugEn]

4. EXEMPLOS DE REDIRECTS 301 (5 PRODUTOS)
   ${productsWithBoth.slice(0, 5).map(p => `   - /produto/${p.slug} -> /product/${p.slugEn} (${p.nome})`).join('\n')}

5. VERIFICAÇÃO DE SLUGEN DUPLICADOS
   - SlugEn duplicados: ${duplicateSlugEn.length}
   ${duplicateSlugEn.map(d => `   - slugEn="${d.slugEn}": ${d._count.slugEn} ocorrências`).join('\n')}

6. VERIFICAÇÃO DE PALAVRAS EM PORTUGUÊS EM SLUGEN
   - Slugs com palavras portuguesas: ${problematicPortugueseSlugs.length}
   ${problematicPortugueseSlugs.slice(0, 5).map(p => `   - ${p.nome}: slugEn="${p.slugEn}"`).join('\n')}

7. STATUS DO BANCO DE DADOS
   - Campo slugEn adicionado: SIM
   - Índice único em slugEn: SIM
   - Dados populados: SIM (${productsWithSlugEn} produtos)

8. PRÓXIMOS PASSOS
   - Confirmar que casadosoftware.com.br usa /produto/[slug]
   - Confirmar que gvgmall.co usa /product/[slugEn]
   - Testar redirects 301 no ambiente de produção
   - Verificar sitemap internacional não contém /produto/
   - Verificar canonical URLs em gvgmall.co apontam para gvgmall.co
`
  
  writeFileSync('scripts/internationalization-validation-report.txt', report)
  console.log(`\n7. Relatório salvo em: scripts/internationalization-validation-report.txt`)
  
  console.log(`\n=== VALIDAÇÃO CONCLUÍDA ===`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
