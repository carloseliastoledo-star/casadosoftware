import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, titulo: true, excerpt: true, html: true }
  })

  const suspicious = /[\u0192\u00f5\u00e6\u00c3\u00c6]/

  for (const p of posts) {
    const fields = { titulo: p.titulo, excerpt: p.excerpt ?? '', html: (p.html ?? '').slice(0, 2000) }
    for (const [field, val] of Object.entries(fields)) {
      if (!suspicious.test(val)) continue
      const idx = val.search(suspicious)
      const snippet = val.slice(Math.max(0, idx - 15), idx + 25)
      console.log(`POST ${p.id} [${field}]: ...${snippet}...`)
    }
  }
  console.log('done')
}

main().catch(console.error).finally(() => prisma.$disconnect())
