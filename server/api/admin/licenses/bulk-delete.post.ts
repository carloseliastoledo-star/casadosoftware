import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const body = await readBody(event)

  const idsRaw = Array.isArray(body?.ids) ? body.ids : []
  const ids = idsRaw.map((x: any) => String(x || '').trim()).filter(Boolean)

  const produtoId = String(body?.produtoId || '').trim()
  const deleteAll = Boolean(body?.deleteAll)

  if (deleteAll) {
    if (!produtoId) {
      throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
    }

    const result = await prisma.licenca.deleteMany({
      where: {
        produtoId,
        status: 'STOCK',
        orderId: null,
        customerId: null
      }
    })

    return { ok: true, deleted: result.count }
  }

  if (!ids.length) {
    return { ok: true, deleted: 0 }
  }

  const result = await prisma.licenca.deleteMany({
    where: {
      id: { in: ids },
      status: 'STOCK',
      orderId: null,
      customerId: null
    }
  })

  return { ok: true, deleted: result.count }
})
