import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = event.context.params.id

  const produto = await prisma.produto.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          orders: true,
          licencas: true
        }
      }
    }
  })

  if (!produto) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  if (produto._count.orders > 0) {
    await prisma.produto.update({
      where: { id },
      data: { ativo: false }
    })

    return {
      ok: true,
      deactivated: true,
      message: 'Produto possui pedidos e foi inativado em vez de excluído.'
    }
  }

  if (produto._count.licencas > 0) {
    await prisma.licenca.deleteMany({
      where: { produtoId: id }
    })
  }

  await prisma.produtoCategoria.deleteMany({
    where: { produtoId: id }
  })

  await prisma.produto.delete({
    where: { id }
  })

  return { ok: true }
})
