import { defineEventHandler, setHeader, sendError, createError } from 'h3'
import prisma from '#root/server/db/prisma'

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Se contém vírgula, aspas ou quebra de linha, envolve em aspas
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export default defineEventHandler(async (event) => {
  try {
    // Buscar todos os produtos com suas categorias
    const produtos = await (prisma as any).produto.findMany({
      include: {
        produtoCategorias: {
          include: {
            categoria: {
              select: {
                nome: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    // Definir headers do CSV (campos solicitados)
    const headers = [
      'name',
      'slug',
      'description',
      'shortDescription',
      'price',
      'compareAtPrice',
      'costPrice',
      'image',
      'gallery',
      'category',
      'stock',
      'active',
      'featured',
      'productType',
      'deliveryInstructions',
      'googleAdsConversionLabel',
      'googleAdsConversionValue',
      'seoTitle',
      'seoDescription',
      'seoContent',
      'cardItems',
      'tutorialTitulo',
      'tutorialSubtitulo',
      'tutorialConteudo'
    ]

    // Montar linhas do CSV
    const rows = produtos.map((p: any) => {
      const categorias = (p.produtoCategorias || [])
        .map((pc: any) => pc.categoria?.nome)
        .filter(Boolean)
        .join('|')

      return [
        escapeCsv(p.nome),
        escapeCsv(p.slug),
        escapeCsv(p.descricao),
        escapeCsv(p.descricao?.substring(0, 150)), // shortDescription
        escapeCsv(p.preco),
        escapeCsv(p.precoAntigo),
        '', // costPrice - não existe no schema
        escapeCsv(p.imagem),
        '', // gallery - não existe no schema (usar imagem como fallback)
        escapeCsv(categorias),
        '999', // stock - default alto
        escapeCsv(p.ativo ? 'true' : 'false'),
        'false', // featured - não existe no schema
        'digital', // productType - assumindo digital
        '', // deliveryInstructions - não existe
        escapeCsv(p.googleAdsConversionLabel),
        escapeCsv(p.googleAdsConversionValue),
        escapeCsv(p.seoTitle),
        escapeCsv(p.seoDescription),
        escapeCsv(p.seoContent),
        escapeCsv(p.cardItems),
        escapeCsv(p.tutorialTitulo),
        escapeCsv(p.tutorialSubtitulo),
        escapeCsv(p.tutorialConteudo)
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    // Configurar headers para download
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="produtos-export.csv"')

    return csvContent
  } catch (error: any) {
    console.error('[api/admin/produtos/export] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao exportar produtos: ' + (error?.message || 'Erro desconhecido')
    })
  }
})
