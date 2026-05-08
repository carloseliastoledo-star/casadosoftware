import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  console.log('[takeover] =========================================')
  console.log('[takeover] REQUEST RECEIVED')
  console.log('[takeover] =========================================')
  
  try {
    console.log('[takeover] Getting session...')
    const session = requireAdminSession(event)
    console.log('[takeover] Session:', session)

    console.log('[takeover] Reading body...')
    const body = await readBody(event) || {}
    const conversationId = String(body?.conversationId || '').trim()
    console.log('[takeover] ConversationId:', conversationId)

    if (!conversationId) {
      throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
    }

    console.log('[takeover] Finding user...')
    const user = await prisma.adminUser.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, role: true }
    })

    console.log('[takeover] User:', user)

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
    }

    console.log('[takeover] Finding conversation...')
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    })

    console.log('[takeover] Conversation:', conversation)

    if (!conversation) {
      throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
    }

    console.log('[takeover] Updating conversation with agentId:', user.id)

    if (conversation.status !== 'HUMAN') {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { status: 'HUMAN', agentId: user.id }
      })
    } else if (!conversation.agentId) {
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: { agentId: user.id }
      })
    }

    console.log('[takeover] Creating system message...')
    await prisma.chatMessage.create({
      data: {
        conversationId,
        sender: 'SYSTEM',
        content: 'Atendimento transferido para um atendente humano.'
      }
    })

    console.log('[takeover] =========================================')
    console.log('[takeover] SUCCESS')
    console.log('[takeover] =========================================')
    return { ok: true }
  } catch (err: any) {
    console.log('[takeover] =========================================')
    console.error('[takeover] ERROR:', err)
    console.error('[takeover] Error message:', err?.message)
    console.error('[takeover] Error stack:', err?.stack)
    console.log('[takeover] =========================================')
    if (err?.statusCode) {
      throw err
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao assumir atendimento' })
  }
})
