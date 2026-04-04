import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const rows = await prisma.order.groupBy({ by: ['storeSlug'], _count: { id: true } })
console.log(JSON.stringify(rows, null, 2))
const total = await prisma.order.count()
console.log('Total orders:', total)
await prisma.$disconnect()
