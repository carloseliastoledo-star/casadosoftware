import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const users = await prisma.adminUser.findMany({ select: { id: true, email: true, role: true } })
console.log('Admin users:', JSON.stringify(users, null, 2))
await prisma.$disconnect()
