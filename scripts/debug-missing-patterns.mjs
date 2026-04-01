import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, html: true, excerpt: true }
  })

  // Find all 2-char sequences starting with ├ (U+251C) in the DB
  const found = new Map()

  for (const p of posts) {
    for (const field of [p.html, p.excerpt]) {
      if (!field) continue
      let i = 0
      while (i < field.length) {
        if (field.codePointAt(i) === 0x251C) {
          const next = field[i + 1]
          if (next) {
            const key = field[i] + next
            const cp = next.codePointAt(0).toString(16).padStart(4, '0')
            if (!found.has(key)) {
              const ctx = field.slice(Math.max(0, i - 5), i + 8)
              found.set(key, { cp, ctx })
            }
          }
        }
        i++
      }
    }
  }

  console.log('\n=== ├X patterns found in BlogPost html/excerpt ===')
  for (const [seq, { cp, ctx }] of [...found.entries()].sort()) {
    const b1 = 0xC3 // ├ is always CP437 for byte C3 (first byte of 2-byte UTF-8 for U+00C0..U+00FF)
    const b2 = parseInt(cp, 16) // second Unicode codepoint
    console.log(`├ + U+${cp} | context: ${JSON.stringify(ctx)}`)
  }

  // Also check for non-├ suspicious sequences (box drawing chars combined with printable)
  const boxChars = new Set([0x2551, 0x2557, 0x255D, 0x2502, 0x2524, 0x2561, 0x2562])
  for (const p of posts) {
    for (const field of [p.html]) {
      if (!field) continue
      for (const cp of boxChars) {
        const char = String.fromCodePoint(cp)
        if (field.includes(char)) {
          const idx = field.indexOf(char)
          console.log(`Box char U+${cp.toString(16)} in post ${p.id.slice(0,8)}: ${JSON.stringify(field.slice(Math.max(0,idx-10), idx+10))}`)
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
