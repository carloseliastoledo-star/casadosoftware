import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, html: true, excerpt: true }
  })

  // Patterns confirmed via debug: öæ, Ô£à, Ô¡É
  const PATTERNS = [
    { name: 'öæ',  re: /\u00F6\u00E6/g },
    { name: 'Ô£à', re: /\u00D4\u00A3\u00E0/g },
    { name: 'Ô¡É', re: /\u00D4\u00A1\u00C9/g },
    // broader Ô-prefix sequences (Ô + non-ASCII)
    { name: 'Ô+?', re: /\u00D4[\u0080-\u00FF]{1,2}/g },
  ]

  for (const p of posts) {
    for (const field of ['html', 'excerpt']) {
      const val = p[field]
      if (!val) continue
      for (const pat of PATTERNS) {
        const matches = [...val.matchAll(pat.re)]
        if (!matches.length) continue
        for (const m of matches) {
          const idx = m.index
          const ctx = val.slice(Math.max(0, idx - 10), idx + 20)
          const hex = [...m[0]].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
          console.log(`[${p.slug}] [${field}] pat=${pat.name} hex=${hex} ctx=${JSON.stringify(ctx)}`)
        }
      }
    }
  }
  console.log('done')
}

main().catch(console.error).finally(() => prisma.$disconnect())
