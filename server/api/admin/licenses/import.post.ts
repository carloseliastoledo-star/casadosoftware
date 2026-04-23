import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  const body = await readBody(event)

  const product_id = String(body?.product_id || '').trim()
  const keysRaw = String(body?.keys || '')

  if (!product_id || !keysRaw) {
    throw createError({ statusCode: 400, statusMessage: 'product_id e keys são obrigatórios' })
  }

  const produto = await prisma.produto.findFirst({
    where: {
      OR: [{ id: product_id }, { slug: product_id }]
    },
    select: { id: true }
  })

  if (!produto) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  }

  const licenses = keysRaw
    .split(/\r?\n/)
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 10)

  if (licenses.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhuma licença válida encontrada' })
  }

  const data = licenses.map((key: string) => ({
    chave: key,
    status: 'STOCK',
    produtoId: produto.id,
    storeSlug
  }))

  const result = await prisma.licenca.createMany({
    data
  })

  return {
    inserted: result.count
  }
})
