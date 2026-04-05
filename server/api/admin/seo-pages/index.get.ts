import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const q = getQuery(event)
  const locale = q.locale ? String(q.locale) : undefined
  const status = q.status ? String(q.status) : undefined
  const search = q.search ? String(q.search).trim() : undefined

  const where: any = {}
  if (locale) where.locale = locale
  if (status) where.status = status
  if (search) where.title = { contains: search }

  const pages = await (prisma as any).seoPage.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      locale: true,
      slug: true,
      title: true,
      seoTitle: true,
      templateKey: true,
      status: true,
      noindex: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return { ok: true, pages }
})
