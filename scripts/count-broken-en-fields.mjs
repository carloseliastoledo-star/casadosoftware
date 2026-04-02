import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const prods = await prisma.produto.findMany({
    select: { slug: true, descricaoEn: true, tutorialConteudoEn: true, tutorialTituloEn: true }
  })

  const broken = /[\u0192\u00AD\u251C\u252C]/
  const results = []

  for (const p of prods) {
    const fields = []
    if (p.descricaoEn && broken.test(p.descricaoEn)) fields.push('descricaoEn')
    if (p.tutorialConteudoEn && broken.test(p.tutorialConteudoEn)) fields.push('tutorialConteudoEn')
    if (p.tutorialTituloEn && broken.test(p.tutorialTituloEn)) fields.push('tutorialTituloEn')
    if (fields.length) results.push({ slug: p.slug, fields })
  }

  console.log(`\nProdutos com EN corrompido: ${results.length}`)
  for (const r of results) console.log(` - ${r.slug}: ${r.fields.join(', ')}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
