import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET = '\u0192\u00F5\u00E6'  // ƒõæ

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, titulo: true, html: true },
    where: { publicado: true }
  })

  for (const p of posts) {
    const hay = (p.html || '') + (p.titulo || '')
    if (!hay.includes(TARGET)) continue
    console.log('\n--- slug/titulo:', p.titulo)
    const idx = hay.indexOf(TARGET)
    const snippet = hay.slice(Math.max(0, idx - 20), idx + 30)
    const chars = [...snippet].map(c => `${c}=U+${c.codePointAt(0).toString(16).padStart(4,'0')}`)
    console.log(chars.join(' '))
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
