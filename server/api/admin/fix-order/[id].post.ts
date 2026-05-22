export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const prisma = event.context.prisma

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: { id: true, deletedAt: true, status: true }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  if (order.deletedAt === null) {
    return { ok: true, message: 'Pedido já está com deletedAt null', order }
  }

  const updated = await (prisma as any).order.update({
    where: { id },
    data: { deletedAt: null }
  })

  return { ok: true, message: 'Pedido corrigido', order: updated }
})
