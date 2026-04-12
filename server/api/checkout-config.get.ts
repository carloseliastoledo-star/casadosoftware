/**
 * GET /api/checkout-config — retorna configurações públicas do checkout (order bump, gateways)
 */
import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)

  const settings = await (prisma as any).siteSettings.findFirst({
    where: storeSlug ? { storeSlug } : undefined,
    select: {
      orderBumpTitle: true,
      orderBumpDescription: true,
      orderBumpPrice: true,
    }
  })

  return {
    orderBump: {
      title:       settings?.orderBumpTitle       || 'Suporte premium de instalação',
      description: settings?.orderBumpDescription || 'Receba ajuda prioritária para ativar seu produto sem complicação. Atendimento por WhatsApp em até 2h após a compra.',
      price:       settings?.orderBumpPrice        ?? 19,
    }
  }
})
