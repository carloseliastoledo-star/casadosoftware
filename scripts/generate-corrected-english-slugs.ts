import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Dicionário completo de traduções PT → EN
const translations: Record<string, string> = {
  'licenca': 'license',
  'licença': 'license',
  'licena': 'license',
  'vitalicio': 'lifetime',
  'vitalícia': 'lifetime',
  'vitalcia': 'lifetime',
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
  '1-licenca': '1-license',
  '1-licença': '1-license',
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
  'instantnea': 'instant',
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
  'e': 'and',
  'de': 'of',
  'cal': 'cal'
}

// Palavras em português que não devem aparecer em slugs internacionais
const portugueseWords = new Set([
  'licenca', 'licença', 'licena', 'vitalicio', 'vitalícia', 'vitalcia',
  'para', 'com', 'ativacao', 'ativação', 'entrega', 'instantanea', 'instantânea',
  'instantnea', 'chave', 'nota', 'fiscal', 'garantia', 'assinatura', 'anual',
  'profissional', 'atualizacao', 'atualização'
])

function generateEnglishSlug(nome: string, nomeEn: string | null): string {
  if (nomeEn) {
    return slugify(nomeEn)
  }
  
  let slug = slugify(nome)
  
  // Aplicar traduções
  for (const [pt, en] of Object.entries(translations)) {
    const regex = new RegExp(pt, 'gi')
    slug = slug.replace(regex, en)
  }
  
  return slug
}

function validateSlug(slug: string, originalNome: string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Verificar palavras em português
  for (const word of portugueseWords) {
    if (slug.includes(word)) {
      issues.push(`Contém palavra em português: "${word}"`)
    }
  }
  
  // Verificar erros ortográficos comuns
  if (slug.includes('licena')) {
    issues.push('Erro ortográfico: "licena" deve ser "license"')
  }
  if (slug.includes('vitalcia')) {
    issues.push('Erro ortográfico: "vitalcia" deve ser "lifetime"')
  }
  if (slug.includes('instantnea')) {
    issues.push('Erro ortográfico: "instantnea" deve ser "instant"')
  }
  if (slug.includes('profesional')) {
    issues.push('Erro ortográfico: "profesional" deve ser "professional"')
  }
  
  return { valid: issues.length === 0, issues }
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

  const slugMap = new Map<string, string>()
  const validationResults: { produto: string; slugEn: string; issues: string[] }[] = []
  let validCount = 0
  let invalidCount = 0

  for (const produto of produtos) {
    const newSlug = generateEnglishSlug(produto.nome, produto.nomeEn)
    const validation = validateSlug(newSlug, produto.nome)
    
    validationResults.push({
      produto: produto.nome,
      slugEn: newSlug,
      issues: validation.issues
    })
    
    if (validation.valid) {
      validCount++
    } else {
      invalidCount++
    }
    
    // Garantir unicidade adicionando sufixo se necessário
    let finalSlug = newSlug
    let counter = 1
    while (slugMap.has(finalSlug)) {
      finalSlug = `${newSlug}-${counter}`
      counter++
    }
    slugMap.set(finalSlug, produto.id)
  }

  // Gerar CSV de validação
  let csv = 'Produto,URL atual em português,SlugEn gerado,Status,Problemas\n'
  
  for (const result of validationResults) {
    const produto = produtos.find(p => p.nome === result.produto)!
    const currentUrl = `/produto/${produto.slug}`
    const status = result.issues.length === 0 ? 'VALIDO' : 'INVALIDO'
    const problems = result.issues.join('; ')
    csv += `${result.produto},${currentUrl},${result.slugEn},${status},"${problems}"\n`
  }

  writeFileSync('scripts/slug-validation.csv', csv, 'utf-8')
  
  // Gerar relatório de problemas
  const invalidItems = validationResults.filter(r => r.issues.length > 0)
  let report = '=== RELATÓRIO DE VALIDAÇÃO DE SLUGS ===\n\n'
  report += `Total de produtos: ${produtos.length}\n`
  report += `Slugs válidos: ${validCount}\n`
  report += `Slugs com problemas: ${invalidCount}\n\n`
  
  if (invalidItems.length > 0) {
    report += '=== PRODUTOS COM PROBLEMAS ===\n\n'
    for (const item of invalidItems) {
      report += `${item.produto}\n`
      report += `  SlugEn: ${item.slugEn}\n`
      report += `  Problemas:\n`
      for (const issue of item.issues) {
        report += `    - ${issue}\n`
      }
      report += '\n'
    }
  }
  
  writeFileSync('scripts/slug-validation-report.txt', report, 'utf-8')
  
  console.log('=== VALIDAÇÃO CONCLUÍDA ===')
  console.log(`Total de produtos: ${produtos.length}`)
  console.log(`Slugs válidos: ${validCount}`)
  console.log(`Slugs com problemas: ${invalidCount}`)
  console.log('\nArquivos gerados:')
  console.log('  - scripts/slug-validation.csv')
  console.log('  - scripts/slug-validation-report.txt')
  
  if (invalidCount > 0) {
    console.log('\n⚠️  ATENÇÃO: Existem slugs com problemas. Revise o relatório antes de prosseguir.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
