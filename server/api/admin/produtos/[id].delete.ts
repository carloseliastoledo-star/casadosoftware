import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
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
      },
      ProdutoPrecoLoja: { select: { storeSlug: true } }
    }
  })

  // Guard: if storeSlug is 'international', only allow deleting products that belong to it
  // For casadosoftware/others: allow orphan products (legacy) + explicitly owned ones
  if (produto && storeSlug === 'international') {
    const belongsToStore = (produto as any).ProdutoPrecoLoja?.some((l: any) => l.storeSlug === storeSlug)
    if (!belongsToStore) {
      throw createError({ statusCode: 403, statusMessage: 'Produto não pertence a esta loja.' })
    }
  }

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

  await (prisma as any).produtoPrecoLoja.deleteMany({
    where: { produtoId: id }
  })

  await (prisma as any).produtoPrecoMoeda.deleteMany({
    where: { produtoId: id }
  })

  await prisma.produto.delete({
    where: { id }
  })

  return { ok: true }
})
