import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '../../db/prisma'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug obrigatório' })
  }

  const { storeSlug } = getStoreContext()

  const categoria = await (prisma as any).categoria.findUnique({
    where: { slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      ativo: true,
      produtoCategorias: {
        where: {
          produto: { ativo: true }
        },
        select: {
          produto: {
            select: {
              id: true,
              nome: true,
              slug: true,
              descricao: true,
              preco: true,
              precoAntigo: true,
              imagem: true,
              precosLoja: {
                where: { storeSlug: storeSlug || undefined },
                select: { preco: true, precoAntigo: true }
              },
              criadoEm: true
            }
          }
        }
      }
    }
  })

  if (!categoria) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })
  }

  if (!(categoria as any).ativo) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada' })
  }

  type ProdutoItem = {
    id: string
    nome: string
    slug: string
    descricao: string | null
    preco: number
    precoAntigo: number | null
    imagem: string | null
    precosLoja?: Array<{ preco: number; precoAntigo: number | null }>
    criadoEm: Date
  }

  return {
    ok: true,
    categoria: {
      id: categoria.id,
      nome: categoria.nome,
      slug: categoria.slug
    },
    produtos: ((categoria as any).produtoCategorias || [])
      .map((pc: { produto: ProdutoItem }) => pc.produto)
      .filter((p: ProdutoItem | null): p is ProdutoItem => Boolean(p))
      .sort((a: ProdutoItem, b: ProdutoItem) => Number(new Date(b.criadoEm)) - Number(new Date(a.criadoEm)))
      .map((p: ProdutoItem) => {
        const override = (p as any).precosLoja?.[0] || null
        const effectivePrice = override?.preco ?? p.preco
        const effectiveOldPrice = override?.precoAntigo ?? p.precoAntigo

        return {
          id: p.id,
          name: p.nome,
          slug: p.slug,
          description: p.descricao,
          price: effectivePrice,
          precoAntigo: effectiveOldPrice,
          image: p.imagem,
          createdAt: p.criadoEm
        }
      })
  }
})
