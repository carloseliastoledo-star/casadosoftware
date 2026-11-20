import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import prisma from '../../db/prisma'
import { setChatSession } from '../../utils/chatSession'
import { getInitialAssistantMessage } from '../../services/chatRules'

export default defineEventHandler(async (event) => {
  if (!process.env.CUSTOMER_SESSION_SECRET && !process.env.CUSTOMER_RESET_SECRET) {
    throw createError({ statusCode: 503, statusMessage: 'Atendimento temporariamente indisponível' })
  }

  const body = await readBody(event) || {}

  const customerName = String(body?.customerName || '').trim() || null
  const customerEmail = String(body?.customerEmail || '').trim() || null
  const orderNumber = String(body?.orderNumber || '').trim() || null
  const sourcePage = String(body?.sourcePage || '').trim() || null

  const userIp = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || null

  const conversation = await (prisma as any).chatConversation.create({
    data: {
      customerName,
      customerEmail,
      orderNumber,
      status: 'AI',
      sourcePage,
      userIp
    }
  })

  const initialMessageContent = getInitialAssistantMessage()

  await (prisma as any).chatMessage.create({
    data: {
      conversationId: conversation.id,
      sender: 'AI',
      content: initialMessageContent
    }
  })

  setChatSession(event, conversation.id)

  return {
    conversationId: conversation.id,
    status: conversation.status,
    message: initialMessageContent
  }
})
