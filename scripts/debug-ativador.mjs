import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: { slug: 'ativador-office-2024' },
    select: { id: true, titulo: true, html: true }
  })
  if (!post) { console.log('Post not found'); return }

  console.log('ID:', post.id)
  console.log('Titulo:', post.titulo)

  // Find all non-standard chars that could be mojibake
  const suspicious = /[^\x09\x0A\x0D\x20-\x7E\u00C0-\u024F\u2018-\u201F\u2026]/g
  const html = post.html || ''

  const matches = new Set()
  let m
  while ((m = suspicious.exec(html)) !== null) {
    const idx = m.index
    const frag = html.slice(Math.max(0, idx - 5), idx + 10)
    const ch = m[0]
    const cp = ch.codePointAt(0).toString(16).padStart(4,'0')
    matches.add(`U+${cp} (${JSON.stringify(ch)}) in: ${JSON.stringify(frag)}`)
  }

  console.log('\n=== Suspicious chars in HTML ===')
  for (const s of matches) console.log(s)

  // Also find specifically õæ
  const idx2 = html.indexOf('\u00F5\u00E6')
  if (idx2 >= 0) {
    const ctx = html.slice(Math.max(0,idx2-20), idx2+30)
    const hex = [...ctx].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
    console.log('\nõæ found at:', idx2)
    console.log('Context:', JSON.stringify(ctx))
    console.log('Hex:', hex)
  } else {
    console.log('\nõæ NOT found in html')
  }

  // Check TOC-style headings
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
  console.log('\n=== H2 headings ===')
  for (const h of h2s) {
    const text = h[1].replace(/<[^>]+>/g, '')
    const hex = [...text].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
    console.log(JSON.stringify(text))
    if (/[^\x20-\x7E\u00C0-\u024F]/.test(text)) console.log('  HEX:', hex)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
