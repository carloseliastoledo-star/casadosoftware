import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  // Busca todos os produtos com seus storeSlug via ProdutoPrecoLoja
  const produtos = await (prisma as any).produto.findMany({
    select: {
      id: true,
      nome: true,
      slug: true,
      ativo: true,
      criadoEm: true,
      ProdutoPrecoLoja: {
        select: { storeSlug: true, preco: true }
      }
    },
    orderBy: { nome: 'asc' }
  })

  // Agrupar por nome normalizado para detectar duplicados entre lojas
  const byName = new Map<string, any[]>()
  for (const p of produtos) {
    const key = String(p.nome || '').trim().toLowerCase()
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push(p)
  }

  // Filtrar grupos com mais de um produto (mesma nome em lojas diferentes)
  const duplicates = Array.from(byName.entries())
    .filter(([, items]) => items.length > 1)
    .map(([nome, items]) => ({
      nome,
      count: items.length,
      produtos: items.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        ativo: p.ativo,
        criadoEm: p.criadoEm,
        stores: (p.ProdutoPrecoLoja || []).map((l: any) => l.storeSlug)
      }))
    }))

  // Também detectar slugs duplicados (não deve existir pois slug é único, mas checamos)
  const bySlug = new Map<string, any[]>()
  for (const p of produtos) {
    const key = String(p.slug || '').trim().toLowerCase()
    if (!bySlug.has(key)) bySlug.set(key, [])
    bySlug.get(key)!.push(p)
  }
  const slugDuplicates = Array.from(bySlug.entries())
    .filter(([, items]) => items.length > 1)
    .map(([slug, items]) => ({ slug, count: items.length, ids: items.map((p: any) => p.id) }))

  // Produtos sem nenhuma loja associada (órfãos)
  const orphans = produtos
    .filter((p: any) => !p.ProdutoPrecoLoja?.length)
    .map((p: any) => ({ id: p.id, slug: p.slug, nome: p.nome, ativo: p.ativo }))

  return {
    totalProducts: produtos.length,
    duplicatesByName: duplicates,
    duplicatesBySlug: slugDuplicates,
    orphans,
    summary: {
      duplicateNameGroups: duplicates.length,
      orphanCount: orphans.length
    }
  }
})
