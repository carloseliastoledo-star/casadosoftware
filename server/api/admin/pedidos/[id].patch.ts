import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'

type AllowedStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)
  const statusRaw = String(body?.status || '').trim().toUpperCase()

  const allowed: AllowedStatus[] = ['PENDING', 'PAID', 'REJECTED', 'CANCELLED']
  if (!allowed.includes(statusRaw as AllowedStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'status inválido' })
  }

  const order = await prisma.order.findFirst({
    where: whereForStore({ id }, ctx) as any,
    select: { id: true, status: true, storeSlug: true, licencas: { select: { id: true } } }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  if (order.licencas.length > 0 && statusRaw !== 'PAID') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Não é possível alterar status para diferente de PAID quando já existe licença vinculada ao pedido'
    })
  }

  const data: any = { status: statusRaw }
  if (statusRaw === 'PAID') {
    data.pagoEm = new Date()
  } else {
    data.pagoEm = null
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    select: { id: true, status: true, pagoEm: true }
  })

  return { ok: true, order: updated }
})
