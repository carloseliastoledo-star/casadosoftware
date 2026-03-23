import { defineEventHandler } from 'h3'
import prisma from '../db/prisma'
import { getStoreContext } from '../utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)

  try {
    const settings = await (prisma as any).siteSettings.findFirst({
      where: storeSlug ? { storeSlug } : undefined,
      select: { pixGateway: true }
    })

    const gateway = settings?.pixGateway === 'pagarme' ? 'pagarme' : 'mercadopago'
    return { gateway }
  } catch {
    return { gateway: 'mercadopago' }
  }
})
