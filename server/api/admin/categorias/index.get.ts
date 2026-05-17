import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext } from '#root/server/utils/store'

const COMMERCIAL_SLUGS = [
  'windows',
  'office',
  'windows-server',
  'adobe',
  'autodesk',
  'games',
  'electronics'
]

const SLUG_FRIENDLY_NAMES: Record<string, string> = {
  'windows': 'Windows',
  'office': 'Office',
  'windows-server': 'Windows Server',
  'adobe': 'Adobe',
  'autodesk': 'Autodesk',
  'games': 'Games',
  'electronics': 'Electronics',
  'software-computer-software-office-application-software': 'Office',
  'software-computer-software-operating-systems': 'Windows / Operating Systems',
  'software-video-game-software': 'Games',
  'software-computer-software-multimedia-design-software-3d-modeling-software': 'Design & 3D',
  'software-computer-software-multimedia-design-software-web-design-software': 'Web Design',
  'electronics-networking-bridges-routers': 'Routers',
  'electronics-networking-bridges-routers-wireless-routers': 'Wireless Routers',
  'electronics-electronics-accessories-computer-components-input-devices-keyboards': 'Keyboards'
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  let categorias: any[] = []

  if (storeSlug === 'international') {
    // 1. Tentar buscar categorias comerciais
    categorias = await (prisma as any).categoria.findMany({
      where: { storeSlug, slug: { in: COMMERCIAL_SLUGS } },
      orderBy: { nome: 'asc' },
      select: { id: true, storeSlug: true, nome: true, slug: true, ativo: true }
    })

    // 2. Fallback: se não existem comerciais, mostrar todas as internacionais com nomes amigáveis
    if (categorias.length === 0) {
      categorias = await (prisma as any).categoria.findMany({
        where: { storeSlug, ativo: true },
        orderBy: { nome: 'asc' },
        select: { id: true, storeSlug: true, nome: true, slug: true, ativo: true }
      })
    }
  } else {
    categorias = await (prisma as any).categoria.findMany({
      where: storeSlug ? { storeSlug } : undefined,
      orderBy: { nome: 'asc' },
      select: { id: true, storeSlug: true, nome: true, slug: true, ativo: true }
    })
  }

  // Aplicar nomes amigáveis
  const categoriasComNome = categorias.map((c: any) => ({
    ...c,
    nome: SLUG_FRIENDLY_NAMES[c.slug] || c.nome
  }))

  return { ok: true, categorias: categoriasComNome }
})
