import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Look at excerpt from posts we know have issues
  const posts = await prisma.blogPost.findMany({
    where: { id: { in: [
      '25a02262-f5ff-4fdf-9395-3c2729d2bf46',
      '3ef9da67-fb2e-4b43-b981-f482eef2c757',
      '2f9ae69b-3077-4460-ac84-848514f2382e',
      '601a1601-92a5-40b1-b2bb-cf54ed654088',
    ]}},
    select: { id: true, titulo: true, excerpt: true, html: true }
  })

  for (const p of posts) {
    console.log('\n=== POST', p.id.slice(0,8), p.titulo.slice(0,50))
    
    // Show last 20 chars of excerpt with code points
    if (p.excerpt) {
      const tail = p.excerpt.slice(-30)
      const hex = [...tail].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
      console.log('EXCERPT TAIL chars:', JSON.stringify(tail))
      console.log('EXCERPT TAIL hex:  ', hex)
    }
    
    // Find first suspicious non-ASCII non-Latin sequence in HTML
    if (p.html) {
      // Find sequences that are NOT typical Portuguese accented chars
      const match = p.html.match(/[^\x00-\x7F\u00C0-\u00FF]{2,6}/)
      if (match) {
        const frag = match[0]
        const hex = [...frag].map(c => c.codePointAt(0).toString(16).padStart(4,'0')).join(' ')
        const ctx = p.html.slice(Math.max(0, match.index - 10), match.index + 20)
        console.log('HTML fragment:', JSON.stringify(frag), '=', hex)
        console.log('HTML context:', JSON.stringify(ctx))
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
