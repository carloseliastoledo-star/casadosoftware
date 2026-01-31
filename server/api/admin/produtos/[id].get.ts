import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { createError } from 'h3'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext()

  const id = event.context.params.id

  const produto = await (prisma as any).produto.findUnique({
    where: { id },
    include: {
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      },
      produtoCategorias: {
        include: {
          categoria: { select: { id: true, nome: true, slug: true } }
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

  const categorias = ((produto as any).produtoCategorias || []).map((pc: any) => pc.categoria).filter(Boolean)
  const override = (produto as any).precosLoja?.[0] || null

  return {
    ...(produto as any),
    categorias,
    preco: override?.preco ?? (produto as any).preco,
    precoAntigo: override?.precoAntigo ?? (produto as any).precoAntigo,
    precosLoja: undefined
  }
})
