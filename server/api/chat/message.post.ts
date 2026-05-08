import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { shouldTransferToHuman } from '../../services/chatRules'
import { generateAiChatReply } from '../../services/openaiChat'

const MAX_MESSAGE_LENGTH = 2000

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}

  const conversationId = String(body?.conversationId || '').trim()
  const message = String(body?.message || '').trim()
  const customerName = String(body?.customerName || '').trim() || null
  const customerEmail = String(body?.customerEmail || '').trim() || null
  const orderNumber = String(body?.orderNumber || '').trim() || null

  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
  }

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'message é obrigatório' })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `Mensagem muito longa (máximo ${MAX_MESSAGE_LENGTH} caracteres)` })
  }

  const conversation = await (prisma as any).chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  if (conversation.status === 'CLOSED') {
    throw createError({ statusCode: 400, statusMessage: 'Este atendimento foi encerrado. Abra uma nova conversa.' })
  }

  if (customerName || customerEmail || orderNumber) {
    await (prisma as any).chatConversation.update({
      where: { id: conversationId },
      data: {
        ...(customerName && { customerName }),
        ...(customerEmail && { customerEmail }),
        ...(orderNumber && { orderNumber })
      }
    })
  }

  await (prisma as any).chatMessage.create({
    data: {
      conversationId,
      sender: 'CUSTOMER',
      content: message
    }
  })

  const transferToHuman = shouldTransferToHuman(message)

  if (conversation.status === 'HUMAN') {
    return {
      conversationId,
      status: 'HUMAN',
      reply: 'Sua mensagem foi enviada. Um atendente humano responderá por aqui.'
    }
  }

  if (transferToHuman) {
    await (prisma as any).chatConversation.update({
      where: { id: conversationId },
      data: { status: 'HUMAN' }
    })

    const transferMessage = 'Entendi. Vou encaminhar seu atendimento para um atendente humano verificar com mais segurança.'

    await (prisma as any).chatMessage.create({
      data: {
        conversationId,
        sender: 'AI',
        content: transferMessage
      }
    })

    return {
      conversationId,
      status: 'HUMAN',
      reply: transferMessage
    }
  }

  const history = await (prisma as any).chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: { sender: true, content: true }
  })

  const aiReply = await generateAiChatReply({
    customerMessage: message,
    history,
    conversation: {
      customerName: conversation.customerName,
      customerEmail: conversation.customerEmail,
      orderNumber: conversation.orderNumber
    }
  })

  await (prisma as any).chatMessage.create({
    data: {
      conversationId,
      sender: 'AI',
      content: aiReply
    }
  })

  return {
    conversationId,
    status: 'AI',
    reply: aiReply
  }
})
