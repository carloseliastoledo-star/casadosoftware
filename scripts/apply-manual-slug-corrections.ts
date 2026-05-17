import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

// Correções manuais para produtos com problemas
const manualCorrections: Record<string, string> = {
  'Autocad 2025 Para Windows (assinatura anual)': 'autocad-2025-windows-annual-subscription',
  'AutoCAD Map 3D 2025 Para Windows (assinatura anual)': 'autocad-map-3d-2025-windows-annual-subscription',
  'Civil 3D 2025 Para Windows (assinatura anual)': 'civil-3d-2025-windows-annual-subscription',
  'Inventor Pro 2026 Para Windows (assinatura anual)': 'inventor-pro-2026-windows-annual-subscription',
  'Maya 2025 Para Windows (assinatura anual)': 'maya-2025-windows-annual-subscription',
  'MICROSOFT OFFICE HOME & BUSINESS 2016 PARA MAC – 32 / 64 BITS – ESD': 'microsoft-office-home-business-2016-mac-3264-bits-esd',
  'MICROSOFT OFFICE HOME & BUSINESS 2019 PARA MAC – 32 / 64 BITS – ESD': 'microsoft-office-home-business-2019-mac-3264-bits-esd',
  'MICROSOFT WINDOWS SERVER 2016 STANDARD – (DOWNLOAD) + NOTA FISCAL': 'microsoft-windows-server-2016-standard-download-esd',
  'MICROSOFT WINDOWS SERVER 2022 STANDARD – (DOWNLOAD) + NOTA FISCAL': 'microsoft-windows-server-2022-standard-download-esd',
  'Office 2024 Home and Business – PC/Mac – Licença Vitalícia + Nota Fiscal e Garantia': 'office-2024-home-business-pcmac-lifetime-license',
  'Office 365 Original para PC e Mac – Entrega Instantânea': 'office-365-original-pc-mac-instant-delivery',
  'Pacote De 50 Device CALs Windows Server 2019 – 32/64 BITS – Licença Vitalícia + Nota Fiscal e Garantia': '50-device-cals-windows-server-2019-3264-bits-lifetime-license',
  'Recap Pro 2025 Para Windows (assinatura anual)': 'recap-pro-2025-windows-annual-subscription',
  'Revit 2025 Para Windows (assinatura anual)': 'revit-2025-windows-annual-subscription',
  'Robot Structural Analysis Pro 2025 Para Windows (assinatura anual)': 'robot-structural-analysis-pro-2025-windows-annual-subscription',
  'Windows 10 Pro – Licença Digital com Ativação Online': 'windows-10-pro-digital-license-activation-online',
  'Windows 11 Pro – Licença Digital com Ativação Online': 'windows-11-pro-digital-license-activation-online'
}

async function main() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      slug: true,
      nomeEn: true
    },
    orderBy: { nome: 'asc' }
  })

  let csv = 'Produto,URL atual em português,SlugEn corrigido,Status\n'
  let correctedCount = 0
  const slugMap = new Map<string, string>()

  for (const produto of produtos) {
    const currentUrl = `/produto/${produto.slug}`
    
    // Verifica se há correção manual
    if (manualCorrections[produto.nome]) {
      const correctedSlug = manualCorrections[produto.nome]
      csv += `${produto.nome},${currentUrl},${correctedSlug},CORRIGIDO\n`
      correctedCount++
      slugMap.set(correctedSlug, produto.id)
    } else {
      // Usa a função automática para os outros
      const slugEn = generateEnglishSlug(produto.nome, produto.nomeEn)
      csv += `${produto.nome},${currentUrl},${slugEn},AUTO\n`
      slugMap.set(slugEn, produto.id)
    }
  }

  writeFileSync('scripts/slug-mapping-final.csv', csv, 'utf-8')
  
  console.log('=== CORREÇÕES APLICADAS ===')
  console.log(`Total de produtos: ${produtos.length}`)
  console.log(`Correções manuais: ${correctedCount}`)
  console.log(`Correções automáticas: ${produtos.length - correctedCount}`)
  console.log('\nArquivo gerado: scripts/slug-mapping-final.csv')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const translations: Record<string, string> = {
  'licenca': 'license',
  'licença': 'license',
  'vitalicio': 'lifetime',
  'vitalícia': 'lifetime',
  'original': 'original',
  'digital': 'digital',
  'microsoft': 'microsoft',
  'windows': 'windows',
  'office': 'office',
  'professional': 'professional',
  'profissional': 'professional',
  'plus': 'plus',
  'personal': 'personal',
  'home': 'home',
  'business': 'business',
  'pro': 'pro',
  '1tb': '1tb',
  'atualizacao': 'update',
  'atualização': 'update',
  'mac': 'mac',
  'pc': 'pc',
  'para': 'for',
  'com': 'with',
  'ativacao': 'activation',
  'ativação': 'activation',
  'entrega': 'delivery',
  'instantanea': 'instant',
  'instantânea': 'instant',
  'chave': 'key',
  'bits': 'bits',
  'esd': 'esd',
  'download': 'download',
  'nota': 'invoice',
  'fiscal': 'fiscal',
  'garantia': 'warranty',
  'account': 'account',
  'family': 'family',
  'global': 'global',
  'premium': 'premium',
  'standard': 'standard',
  'enterprise': 'enterprise',
  'ultimate': 'ultimate',
  'edition': 'edition',
  'deluxe': 'deluxe',
  'complete': 'complete',
  'steam': 'steam',
  'xbox': 'xbox',
  'ps4': 'ps4',
  'ps5': 'ps5',
  'series': 'series',
  'live': 'live',
  'united': 'united',
  'states': 'states',
  'router': 'router',
  'gaming': 'gaming',
  'keyboard': 'keyboard',
  'rgb': 'rgb',
  'lighting': 'lighting',
  'black': 'black',
  'perpetual': 'perpetual',
  'one-time': 'one-time',
  'payment': 'payment',
  'lifetime': 'lifetime',
  'access': 'access',
  'project': 'project',
  'visio': 'visio',
  'server': 'server',
  'datacenter': 'datacenter',
  'core': 'core',
  'suite': 'suite',
  'graphics': 'graphics',
  'autocad': 'autocad',
  'inventor': 'inventor',
  'revit': 'revit',
  'navisworks': 'navisworks',
  'civil': 'civil',
  'cypecad': 'cypecad',
  'lumion': 'lumion',
  'maya': 'maya',
  'illustrator': 'illustrator',
  'canva': 'canva',
  'eset': 'eset',
  'security': 'security',
  'kaspersky': 'kaspersky',
  'devices': 'devices',
  'year': 'year',
  'mikrotik': 'mikrotik',
  'assinatura': 'subscription',
  'assinatura-anual': 'annual-subscription',
  'anual': 'annual',
  'assinatura anual': 'annual-subscription'
}

function generateEnglishSlug(nome: string, nomeEn: string | null): string {
  if (nomeEn) {
    return slugify(nomeEn)
  }
  
  let slug = slugify(nome)
  
  for (const [pt, en] of Object.entries(translations)) {
    const regex = new RegExp(pt, 'gi')
    slug = slug.replace(regex, en)
  }
  
  return slug
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
