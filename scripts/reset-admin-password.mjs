/**
 * Usage:
 *   DATABASE_URL=<url> ADMIN_EMAIL=admin@gvgmall.co NEW_PASSWORD=suasenha node scripts/reset-admin-password.mjs
 */
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const email = process.env.ADMIN_EMAIL
const newPassword = process.env.NEW_PASSWORD

if (!email || !newPassword) {
  console.error('Usage: DATABASE_URL=<url> ADMIN_EMAIL=<email> NEW_PASSWORD=<senha> node scripts/reset-admin-password.mjs')
  process.exit(1)
}

const hash = await bcrypt.hash(newPassword, 10)
const user = await prisma.adminUser.findFirst({ where: { email } })

if (!user) {
  console.error('❌ Admin não encontrado:', email)
  process.exit(1)
}

await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: hash } })
console.log('✅ Senha atualizada para:', email)
await prisma.$disconnect()
