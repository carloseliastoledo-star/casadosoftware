import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.blogPost.findFirst({
    where: { slug: 'ativador-office-2024' },
    select: { id: true, html: true }
  })
  if (!post) { console.log('not found'); return }

  const html = post.html || ''

  // Show hex for every non-standard char found
  const re = /[^\x09\x0A\x0D\x20-\x7E\u00C0-\u024F]/g
  let m
  const seen = new Map()
  while ((m = re.exec(html)) !== null) {
    const idx = m.index
    const key = html.slice(Math.max(0, idx - 1), idx + 6)
    if (seen.has(key)) continue
    seen.set(key, true)
    const hex = [...key].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
    console.log('CTX hex:', hex, ' | ctx:', JSON.stringify(key))
  }

  // Check all heading tags (h1-h4)
  const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
  console.log('\n=== ALL HEADINGS ===')
  for (const h of headings) {
    const text = h[1].replace(/<[^>]+>/g, '').trim()
    const hex = [...text].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
    const hasWeird = /[^\x20-\x7E\u00C0-\u024F\u2018-\u201F\u2026]/.test(text)
    console.log((hasWeird ? '*** ' : '    ') + JSON.stringify(text))
    if (hasWeird) console.log('    HEX:', hex)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
