import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'
import { defaultHomeTheme, defaultHomeThemeIntl, parseHomeThemeJson } from '#root/server/utils/homeTheme'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const prismaAny = prisma as any
  const fallback = storeSlug === 'international' ? defaultHomeThemeIntl() : defaultHomeTheme()

  try {
    const row = storeSlug
      ? await prismaAny.siteSettings.findFirst({ where: { storeSlug }, select: { homeThemeJson: true } })
      : await prismaAny.siteSettings.findFirst({ select: { homeThemeJson: true } })

    const theme = parseHomeThemeJson(row?.homeThemeJson) ?? fallback
    return { ok: true, theme }
  } catch (err: any) {
    console.error('[admin/home-theme.get] error:', err?.message || err)
    return { ok: true, theme: fallback }
  }
})
