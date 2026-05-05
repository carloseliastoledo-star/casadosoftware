import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma'
import { requireAdminSession } from '../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'
import { validateHomeTheme } from '#root/server/utils/homeTheme'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)
  const prismaAny = prisma as any

  const body = await readBody(event)

  const result = validateHomeTheme(body)
  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: `Tema inválido: ${result.error}` })
  }

  const homeThemeJson = JSON.stringify(result.theme)

  try {
    const existing = storeSlug
      ? await prismaAny.siteSettings.findFirst({ where: { storeSlug }, select: { id: true } })
      : await prismaAny.siteSettings.findFirst({ select: { id: true } })

    if (existing) {
      await prismaAny.siteSettings.update({
        where: { id: existing.id },
        data: { homeThemeJson },
        select: { id: true }
      })
    } else {
      await prismaAny.siteSettings.create({
        data: { ...(storeSlug ? { storeSlug } : {}), homeThemeJson },
        select: { id: true }
      })
    }

    return { ok: true, theme: result.theme }
  } catch (err: any) {
    console.error('[admin/home-theme.put] error:', err?.message || err)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar tema' })
  }
})
