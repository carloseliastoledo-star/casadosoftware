import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const prods = await prisma.produto.findMany({
    select: { id: true, slug: true, nome: true,
              descricao: true, descricaoEn: true,
              tutorialTitulo: true, tutorialTituloEn: true,
              tutorialSubtitulo: true, tutorialSubtituloEn: true,
              tutorialConteudo: true, tutorialConteudoEn: true,
              cardItems: true }
  })

  const re = /[\u0192\u00AD\u00D4\u251C\u252C][\u0080-\u024F]{1,4}/g
  let total = 0

  for (const p of prods) {
    for (const [field, val] of Object.entries(p)) {
      if (!val || typeof val !== 'string') continue
      let m
      re.lastIndex = 0
      while ((m = re.exec(val)) !== null) {
        const hex = [...m[0].slice(0,5)].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
        const ctx = val.slice(Math.max(0, m.index - 5), m.index + 25).replace(/\n/g,' ')
        console.log(`[${p.slug}] field=${field}  hex=${hex}  ctx: ${JSON.stringify(ctx)}`)
        total++
        if (total > 50) { console.log('...truncated'); return }
      }
    }
  }
  console.log(`\nTotal: ${total}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
