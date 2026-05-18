import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const email = process.env.ADMIN_EMAIL
const password = process.env.NEW_PASSWORD

if (!email || !password) {
  console.error('Usage: DATABASE_URL=<url> ADMIN_EMAIL=<email> NEW_PASSWORD=<senha> node scripts/create-admin.mjs')
  process.exit(1)
}

const existing = await prisma.adminUser.findFirst({ where: { email } })
if (existing) {
  const hash = await bcrypt.hash(password, 10)
  await prisma.adminUser.update({ where: { id: existing.id }, data: { passwordHash: hash } })
  console.log('✅ Senha atualizada para:', email)
} else {
  const hash = await bcrypt.hash(password, 10)
  await prisma.adminUser.create({
    data: { id: randomUUID(), email, passwordHash: hash, role: 'admin' }
  })
  console.log('✅ Admin criado:', email)
}
await prisma.$disconnect()
