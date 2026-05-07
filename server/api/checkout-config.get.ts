import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'

function parseOrderBumps(settings: any) {
  try {
    const parsed = JSON.parse(String(settings?.orderBumpsJson || '[]'))
    if (Array.isArray(parsed)) {
      const items = parsed
        .map((item: any) => ({
          id: String(item?.id || '').trim(),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
          price: Number(item?.price || 0),
          active: item?.active !== false
        }))
        .filter((item: any) => item.id && item.title && item.price > 0 && item.active)

      if (items.length) return items
    }
  } catch {}

  return [{
    id: 'default',
    title: settings?.orderBumpTitle || 'Suporte premium de instalação',
    description: settings?.orderBumpDescription || 'Receba ajuda prioritária para ativar seu produto sem complicação. Atendimento por WhatsApp em até 2h após a compra.',
    price: settings?.orderBumpPrice ?? 19,
    active: true
  }]
}

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)

  const settings = await (prisma as any).siteSettings.findFirst({
    where: storeSlug ? { storeSlug } : undefined,
    select: {
      orderBumpTitle: true,
      orderBumpDescription: true,
      orderBumpPrice: true,
      orderBumpsJson: true
    }
  })

  const orderBumps = parseOrderBumps(settings)

  return {
    orderBumps,
    orderBump: orderBumps[0]
  }
})
