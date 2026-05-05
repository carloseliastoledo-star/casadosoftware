import { defineEventHandler, setHeader } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'
import { parseHomeThemeJson } from '#root/server/utils/homeTheme'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

  const { storeSlug } = getStoreContext()
  const prismaAny = prisma as any

  try {
    const row = storeSlug
      ? await prismaAny.siteSettings.findFirst({ where: { storeSlug }, select: { homeThemeJson: true } })
      : await prismaAny.siteSettings.findFirst({ select: { homeThemeJson: true } })

    const theme = parseHomeThemeJson(row?.homeThemeJson)
    return { ok: true, theme }
  } catch (err: any) {
    console.error('[api/home-theme] error:', err?.message || err)
    return { ok: true, theme: null }
  }
})
