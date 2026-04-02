import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const prods = await prisma.produto.findMany({
    select: { id: true, slug: true, descricao: true }
  })

  // Find all sequences starting with ƒ (U+0192) or other suspicious chars
  const re = /[\u0192\u00AD][\u0080-\u024F]{1,4}/g
  const found = new Map()

  for (const p of prods) {
    if (!p.descricao) continue
    let m
    re.lastIndex = 0
    while ((m = re.exec(p.descricao)) !== null) {
      const key = m[0].slice(0, 5)
      if (found.has(key)) continue
      const hex = [...key].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
      const ctx = p.descricao.slice(Math.max(0, m.index - 5), m.index + 20).replace(/\n/g,' ')
      found.set(key, { hex, ctx, slug: p.slug })
    }
  }

  console.log('\n=== Suspicious patterns in Produto.descricao ===')
  for (const [seq, { hex, ctx, slug }] of found) {
    console.log(`[${slug}] hex: ${hex}  ctx: ${JSON.stringify(ctx)}`)
  }
  console.log(`\nTotal unique patterns: ${found.size}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
