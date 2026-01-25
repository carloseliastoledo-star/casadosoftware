import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

const STATE_KEY = 'woo_orders_365d'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const state = await prisma.wooImportState.findUnique({ where: { key: STATE_KEY } })

  return {
    ok: true,
    state: state
      ? {
          key: state.key,
          resource: state.resource,
          after: state.after,
          nextPage: state.nextPage,
          done: state.done,
          updatedAt: state.updatedAt
        }
      : null
  }
})
