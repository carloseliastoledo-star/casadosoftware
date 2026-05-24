import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const slugs = ['office-2021-pro', 'windows-11-pro', 'windows-10-pro', 'office-365']
  const results = {}

  for (const slug of slugs) {
    const produto = await prisma.produto.findFirst({
      where: { slug },
      select: {
        id: true,
        slug: true,
        nome: true,
        ativo: true,
        tutorialTitulo: true,
        tutorialSubtitulo: true,
        tutorialConteudo: true,
        tutorialTituloEn: true,
        tutorialConteudoEn: true,
        descricao: true,
        imagem: true,
        preco: true
      }
    })

    results[slug] = produto ? {
      found: true,
      id: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      ativo: produto.ativo,
      hasTutorialTitulo: !!produto.tutorialTitulo,
      tutorialTituloLength: produto.tutorialTitulo?.length || 0,
      hasTutorialConteudo: !!produto.tutorialConteudo,
      tutorialConteudoLength: produto.tutorialConteudo?.length || 0,
      hasDescricao: !!produto.descricao,
      descricaoLength: produto.descricao?.length || 0,
      hasImagem: !!produto.imagem,
      preco: produto.preco
    } : {
      found: false
    }
  }

  // Também buscar todos os produtos que têm tutorialTitulo preenchido
  const allWithTutorial = await prisma.produto.findMany({
    where: {
      tutorialTitulo: { not: null }
    },
    select: {
      id: true,
      slug: true,
      nome: true,
      ativo: true,
      tutorialTitulo: true,
      tutorialConteudo: true
    }
  })

  return {
    success: true,
    specific: results,
    allWithTutorial: allWithTutorial.map(p => ({
      slug: p.slug,
      nome: p.nome,
      ativo: p.ativo,
      hasTutorialTitulo: !!p.tutorialTitulo,
      hasTutorialConteudo: !!p.tutorialConteudo
    }))
  }
})
