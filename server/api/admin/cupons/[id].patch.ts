import { createError, defineEventHandler, readBody } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(event.context.params?.id || '')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)

  const data: any = {}
  if (typeof body?.active === 'boolean') data.active = body.active
  if (body?.startsAt !== undefined) data.startsAt = body.startsAt ? new Date(String(body.startsAt)) : null
  if (body?.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(String(body.expiresAt)) : null
  if (body?.maxUses !== undefined) {
    const maxUsesRaw = body.maxUses
    data.maxUses = maxUsesRaw === '' || maxUsesRaw === null ? null : Number(maxUsesRaw)
  }

  return await prisma.cupom.update({
    where: { id },
    data
  })
})
