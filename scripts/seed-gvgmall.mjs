import { PrismaClient } from '@prisma/client'
import { createHash, randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Conectando ao banco gvgmall...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':****@'))

  // SiteSettings
  const existing = await prisma.siteSettings.findFirst({ where: { storeSlug: 'international' } })
  if (!existing) {
    await prisma.siteSettings.create({
      data: {
        id: randomUUID(),
        storeSlug: 'international',
        updatedAt: new Date(),
      }
    })
    console.log('✅ SiteSettings criado para storeSlug=international')
  } else {
    console.log('ℹ️  SiteSettings já existe:', existing.siteName)
  }

  // Admin user
  const adminEmail = 'admin@gvgmall.co'
  const adminPassword = process.env.GVGMALL_ADMIN_PASSWORD || 'changeme123'
  const existingAdmin = await prisma.adminUser.findFirst({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.default.hash(adminPassword, 10)
    await prisma.adminUser.create({
      data: {
        id: randomUUID(),
        email: adminEmail,
        passwordHash: hash,
        role: 'admin',
      }
    })
    console.log('✅ Admin criado:', adminEmail, '| senha:', adminPassword)
  } else {
    console.log('ℹ️  Admin já existe:', adminEmail)
  }

  console.log('\n✅ Seed gvgmall concluído.')
}

main()
  .catch((e) => { console.error('❌ Erro:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
