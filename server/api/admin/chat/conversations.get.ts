import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const query = getQuery(event)
  const status = String(query?.status || '').trim() || null
  const search = String(query?.search || '').trim() || null

  const where: any = {}
  if (status && ['AI', 'WAITING_HUMAN', 'HUMAN', 'CLOSED'].includes(status)) {
    where.status = status
  }
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { customerEmail: { contains: search } },
      { orderNumber: { contains: search } }
    ]
  }

  const conversations = await prisma.chatConversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      orderNumber: true,
      status: true,
      needsHuman: true,
      humanRequestedAt: true,
      sourcePage: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true }
      }
    }
  })

  const result = conversations.map((conv: any) => ({
    id: conv.id,
    customerName: conv.customerName || 'Cliente sem nome',
    customerEmail: conv.customerEmail,
    orderNumber: conv.orderNumber,
    status: conv.status,
    needsHuman: conv.needsHuman,
    humanRequestedAt: conv.humanRequestedAt,
    sourcePage: conv.sourcePage,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    lastMessage: conv.messages[0]?.content || null
  }))

  return { ok: true, conversations: result }
})
