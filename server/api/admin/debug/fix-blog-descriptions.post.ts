import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

const uniqueDescriptions: Record<string, string> = {
  'windows-11': 'Aprenda como instalar, ativar e configurar o Windows 11 Pro com nossa chave digital original. Guia completo com instruções passo a passo.',
  'windows-10': 'Descubra como ativar o Windows 10 Pro de forma segura e original. Tutorial detalhado para instalação e ativação por telefone.',
  'office-365': 'Saiba como instalar o Office 365, configurar o Microsoft Authenticator e ativar sua conta em até 5 dispositivos simultaneamente.',
  'office-2021': 'Guia completo para ativar o Office 2021 Pro Plus por telefone. Instruções detalhadas para instalação e ativação da licença.',
  'autocad': 'Tutorial para ativar AutoCAD com licença original. Aprenda como instalar e validar seu software Autodesk corretamente.',
  'antivirus': 'Proteja seu computador com as melhores soluções de antivírus. Compare Kaspersky, Norton, McAfee e escolha a ideal.',
  'licencas-digitais': 'Entenda o que são licenças digitais, como funcionam e por que são uma opção econômica e segura para Windows e Office.',
  'seguranca': 'Dicas essenciais de segurança digital para proteger seus dados e dispositivos. Aprenda sobre senhas fortes e boas práticas.',
  'backup': 'Tutorial completo sobre como fazer backup de seus arquivos no Windows. Proteja seus dados contra perda e formatação.',
  'ativacao': 'Guia geral sobre ativação de softwares Microsoft. Entenda os métodos de ativação online, por telefone e digital.',
  'comparativo': 'Compare Windows OEM vs Retail, Office 365 vs 2021, e descubra qual licença é a melhor para suas necessidades.',
  'solucoes': 'Soluções para problemas comuns de ativação Windows e Office. Troubleshooting passo a passo para erros frequentes.'
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const posts = await (prisma as any).blogPost.findMany({
    where: { publicado: true },
    select: {
      id: true,
      slug: true,
      titulo: true,
      excerpt: true
    }
  })

  let updated = 0
  const results = []

  for (const post of posts) {
    const currentDesc = post.excerpt || ''
    const isRepeated = currentDesc.includes('Guia completo com instruções detalhadas, dicas de segurança e soluções para problemas comuns.')

    if (isRepeated) {
      // Encontrar descrição única baseada no slug/título
      let newDesc = currentDesc
      const slugLower = post.slug.toLowerCase()
      const tituloLower = post.titulo.toLowerCase()

      for (const [key, desc] of Object.entries(uniqueDescriptions)) {
        if (slugLower.includes(key) || tituloLower.includes(key)) {
          newDesc = desc
          break
        }
      }

      // Se não encontrou match, usar descrição genérica baseada no título
      if (newDesc === currentDesc) {
        newDesc = `Tutorial completo sobre ${post.titulo}. Aprenda passo a passo com instruções detalhadas e dicas práticas.`
      }

      await (prisma as any).blogPost.update({
        where: { id: post.id },
        data: { excerpt: newDesc }
      })

      updated++
      results.push({
        slug: post.slug,
        titulo: post.titulo,
        oldDesc: currentDesc.substring(0, 50) + '...',
        newDesc: newDesc.substring(0, 50) + '...'
      })
    }
  }

  return {
    success: true,
    total: posts.length,
    updated,
    results
  }
})
