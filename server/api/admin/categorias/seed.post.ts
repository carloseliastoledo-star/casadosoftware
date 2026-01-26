import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const cats = [
    { nome: 'Office', slug: 'office' },
    { nome: 'Autodesk', slug: 'autodesk' },
    { nome: 'Microsoft Windows', slug: 'microsoft-windows' },
    { nome: 'Project & Visio', slug: 'project&visio' },
    { nome: 'Windows Server', slug: 'windows-server' }
  ]

  for (const c of cats) {
    await prisma.categoria.upsert({
      where: { slug: c.slug },
      create: c,
      update: { nome: c.nome }
    })
  }

  const total = await prisma.categoria.count()

  return { ok: true, inserted: cats.length, total }
})
