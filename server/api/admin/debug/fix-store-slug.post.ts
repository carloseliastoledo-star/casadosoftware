import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  if (!storeSlug) {
    return {
      ok: false,
      message: 'Este endpoint só deve ser chamado em lojas com storeSlug configurado (ex: gvgmall.co). storeSlug está vazio.'
    }
  }

  // Count products that need fixing
  const toFix = await (prisma as any).produto.count({
    where: {
      OR: [
        { storeSlug: null },
        { storeSlug: 'casadosoftware' }
      ]
    }
  })

  if (toFix === 0) {
    return {
      ok: true,
      message: 'Nenhum produto precisa de correção.',
      updated: 0,
      storeSlug
    }
  }

  // Fix: update all products with null or casadosoftware storeSlug to current storeSlug
  const result = await (prisma as any).produto.updateMany({
    where: {
      OR: [
        { storeSlug: null },
        { storeSlug: 'casadosoftware' }
      ]
    },
    data: { storeSlug }
  })

  return {
    ok: true,
    message: `Corrigido ${result.count} produtos para storeSlug = '${storeSlug}'`,
    updated: result.count,
    storeSlug
  }
})
