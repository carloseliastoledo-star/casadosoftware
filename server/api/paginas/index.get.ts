import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async () => {
  try {
    const paginas = await prisma.pagina.findMany({
      where: { publicado: true },
      orderBy: { criadoEm: 'asc' },
      select: {
        titulo: true,
        slug: true
      }
    })
    return { ok: true, paginas }
  } catch (err: any) {
    console.error('[api][paginas] db error', err?.message || err)
    return { ok: true, paginas: [] }
  }
})
