import { defineEventHandler } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async () => {
  const prismaAny = prisma as any

  try {
    const paginas = await prismaAny.pagina.findMany({
      where: { publicado: true, showInFooter: true },
      orderBy: [{ footerOrder: 'asc' }, { criadoEm: 'asc' }],
      select: {
        titulo: true,
        slug: true,
        footerOrder: true
      }
    })
    return { ok: true, paginas }
  } catch (err: any) {
    console.error('[api][paginas/footer] db error', err?.message || err)
    return { ok: true, paginas: [] }
  }
})
