import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, titulo: true, excerpt: true },
    where: { publicado: true }
  })

  for (const p of posts) {
    if (!/\u251C/.test(p.titulo || '') && !/\u251C/.test(p.excerpt || '')) continue
    console.log('\n--- TITULO:', p.titulo)
    const chars = [...(p.titulo || '')].map(c => `${c}=U+${c.codePointAt(0).toString(16).padStart(4,'0')}`)
    console.log(chars.join(' '))
    if (p.excerpt && /\u251C/.test(p.excerpt)) {
      console.log('EXCERPT (first 100):', p.excerpt.slice(0, 100))
      const ec = [...p.excerpt.slice(0,100)].map(c => `${c}=U+${c.codePointAt(0).toString(16).padStart(4,'0')}`)
      console.log(ec.join(' '))
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
