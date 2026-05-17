import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

async function main() {
  // Ler o CSV de mapeamento
  const csv = readFileSync('scripts/slug-mapping-final.csv', 'utf-8')
  const lines = csv.split('\n').slice(1) // Pular cabeçalho
  
  let updatedCount = 0
  const updates: { id: string; slugEn: string }[] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const parts = line.split(',')
    if (parts.length < 3) continue
    
    const produtoNome = parts[0]
    const slugEn = parts[2]
    const status = parts[3]
    
    if (status === 'CORRIGIDO' || status === 'AUTO') {
      // Buscar produto pelo nome
      const produto = await prisma.produto.findFirst({
        where: { nome: produtoNome }
      })
      
      if (produto) {
        updates.push({ id: produto.id, slugEn })
      }
    }
  }
  
  // Atualizar produtos em batch
  for (const update of updates) {
    await prisma.produto.update({
      where: { id: update.id },
      data: { slugEn: update.slugEn }
    })
    updatedCount++
  }
  
  console.log(`=== slugEn POPULADO ===`)
  console.log(`Total de produtos atualizados: ${updatedCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
