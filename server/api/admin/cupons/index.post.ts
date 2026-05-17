import { createError, defineEventHandler, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { normalizeCouponCode } from '#root/server/utils/coupon'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext(event)
  const storeSlug = ctx.storeSlug || 'casadosoftware'

  const body = await readBody(event)

  const code = normalizeCouponCode(body?.code)
  const percent = Number(body?.percent)

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Código obrigatório' })
  }

  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Percentual inválido' })
  }

  const startsAt = body?.startsAt ? new Date(String(body.startsAt)) : null
  const expiresAt = body?.expiresAt ? new Date(String(body.expiresAt)) : null

  const maxUsesRaw = body?.maxUses
  const maxUses = maxUsesRaw === '' || maxUsesRaw === null || maxUsesRaw === undefined ? null : Number(maxUsesRaw)
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'maxUses inválido' })
  }

  const active = body?.active === false ? false : true

  return await prisma.cupom.create({
    data: {
      id: randomUUID(),
      code,
      storeSlug,
      percent: Math.round(percent),
      active,
      startsAt,
      expiresAt,
      maxUses
    }
  })
})
