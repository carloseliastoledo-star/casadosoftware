import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const prods = await prisma.produto.findMany({ select: { slug: true, imagem: true } })
  const posts = await prisma.blogPost.findMany({ select: { slug: true, featuredImage: true } })

  const doImages = [
    ...prods.filter(p => p.imagem?.includes('digitaloceanspaces')).map(p => `[produto] ${p.slug}: ${p.imagem}`),
    ...posts.filter(p => p.featuredImage?.includes('digitaloceanspaces')).map(p => `[blog] ${p.slug}: ${p.featuredImage}`)
  ]

  console.log(`\nImagens no DO Spaces: ${doImages.length}`)
  doImages.forEach(l => console.log(' -', l))

  // Check if env vars for Spaces are configured
  console.log('\nDO_SPACES_KEY set:', !!process.env.DO_SPACES_KEY)
  console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT || '(not set)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
