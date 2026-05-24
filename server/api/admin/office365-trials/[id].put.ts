import { defineEventHandler, createError, readBody } from 'h3'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const body = await readBody(event)

    const { status, microsoftLogin, temporaryPassword, checkoutUrl, notes } = body

    const result = await prisma.$executeRawUnsafe(`
      UPDATE Office365TrialLead
      SET status = ?, microsoftLogin = ?, temporaryPassword = ?, checkoutUrl = ?, notes = ?, updatedAt = NOW()
      WHERE id = ?
    `, status || null, microsoftLogin || null, temporaryPassword || null, checkoutUrl || null, notes || null, id)

    return {
      success: true
    }
  } catch (error) {
    console.error('[api/admin/office365-trials/[id]] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao atualizar lead'
    })
  }
})
