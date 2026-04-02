import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.produto.findFirst({
    where: { slug: { contains: 'office-365-vitalicio' } },
    select: { slug: true, descricao: true, descricaoEn: true }
  })
  if (!p) { console.log('NOT FOUND'); return }
  console.log('slug:', p.slug)
  console.log('descricaoEn:', p.descricaoEn ? p.descricaoEn.slice(0, 100) : '(null)')
  console.log('\n--- descricao first 800 chars ---')
  console.log(p.descricao?.slice(0, 800))
  console.log('\n--- codepoints around "incluso" or h2 ---')
  const idx = p.descricao?.indexOf('incluso') ?? -1
  if (idx > -1) {
    const chunk = p.descricao.slice(Math.max(0, idx - 20), idx + 40)
    console.log('raw:', JSON.stringify(chunk))
    console.log('chars:', [...chunk].map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}(${c})`).join(' '))
  }
  // Look for h2 tags
  const h2re = /<h[23][^>]*>(.*?)<\/h[23]>/gi
  let m
  while ((m = h2re.exec(p.descricao || '')) !== null) {
    const inner = m[1].replace(/<[^>]+>/g, '')
    const chars = [...inner].map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}(${c})`).join(' ')
    console.log('\nh2:', JSON.stringify(inner))
    console.log('   ', chars)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
