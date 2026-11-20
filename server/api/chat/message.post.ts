import { defineEventHandler, readBody, createError, setResponseHeader } from 'h3'
import prisma from '../../db/prisma'
import { requireChatSession } from '../../utils/chatSession'
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

  setResponseHeader(event, 'Cache-Control', 'no-store')
  requireChatSession(event, conversationId)

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  if (conversation.status === 'CLOSED') {
    throw createError({ statusCode: 400, statusMessage: 'Este atendimento foi encerrado. Abra uma nova conversa.' })
  }

  if (customerName || customerEmail || orderNumber) {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        ...(customerName && { customerName }),
        ...(customerEmail && { customerEmail }),
        ...(orderNumber && { orderNumber })
      }
    })
  }

  await prisma.chatMessage.create({
    data: {
      conversationId,
      sender: 'CUSTOMER',
      content: message
    }
  })

  const transferToHuman = shouldTransferToHuman(message)

  if (conversation.status === 'HUMAN' || conversation.status === 'WAITING_HUMAN') {
    return {
      conversationId,
      status: conversation.status,
      reply: 'Sua mensagem foi enviada. Um atendente humano responderá por aqui.'
    }
  }

  if (transferToHuman) {
    console.log('[chat] pedido humano detectado:', conversationId, 'current status:', conversation.status)
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { 
        status: 'WAITING_HUMAN',
        needsHuman: true,
        humanRequestedAt: new Date()
      }
    })
    console.log('[chat] status atualizado para WAITING_HUMAN:', conversationId)

    const transferMessage = 'Entendo. Vou encaminhar seu atendimento para um atendente humano verificar com mais segurança.'

    await prisma.chatMessage.create({
      data: {
        conversationId,
        sender: 'AI',
        content: transferMessage
      }
    })

    return {
      conversationId,
      status: 'WAITING_HUMAN',
      reply: transferMessage
    }
  }

  const history = await prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: { sender: true, content: true }
  })

  const aiReply = await generateAiChatReply({
    customerMessage: message,
    history: history.reverse(),
    conversation: {
      customerName: conversation.customerName,
      customerEmail: conversation.customerEmail,
      orderNumber: conversation.orderNumber
    }
  })

  // Verificar se a IA decidiu encaminhar para humano
  const aiWantsToTransfer = shouldTransferToHuman(aiReply)

  await prisma.chatMessage.create({
    data: {
      conversationId,
      sender: 'AI',
      content: aiReply
    }
  })

  if (aiWantsToTransfer) {
    console.log('[chat] IA decidiu encaminhar para humano:', conversationId)
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { 
        status: 'WAITING_HUMAN',
        needsHuman: true,
        humanRequestedAt: new Date()
      }
    })
    return {
      conversationId,
      status: 'WAITING_HUMAN',
      reply: aiReply
    }
  }

  return {
    conversationId,
    status: 'AI',
    reply: aiReply
  }
})
