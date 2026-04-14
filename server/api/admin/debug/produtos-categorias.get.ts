import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      slug: true,
      categorias: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              slug: true,
              ativo: true
            }
          }
        }
      }
    },
    orderBy: { nome: 'asc' }
  })

  return { ok: true, produtos }
})
