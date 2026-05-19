const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function removeDuplicateCategories() {
  try {
    console.log('Buscando todas as categorias...')
    const categorias = await prisma.categoria.findMany({
      orderBy: { nome: 'asc' }
    })

    console.log(`Encontradas ${categorias.length} categorias`)

    // Agrupar categorias por nome (case-insensitive)
    const grouped = {}
    for (const cat of categorias) {
      const normalizedName = cat.nome.toLowerCase().trim()
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = []
      }
      grouped[normalizedName].push(cat)
    }

    // Identificar duplicatas
    const duplicates = Object.values(grouped).filter(group => group.length > 1)
    console.log(`Encontradas ${duplicates.length} categorias duplicadas`)

    let deletedCount = 0
    let updatedAssociationsCount = 0

    for (const group of duplicates) {
      console.log(`\nCategoria duplicada: ${group[0].nome}`)
      console.log(`  IDs: ${group.map(c => c.id).join(', ')}`)

      // Manter a primeira categoria e deletar as outras
      const keep = group[0]
      const toDelete = group.slice(1)

      for (const cat of toDelete) {
        console.log(`  Deletando categoria duplicada: ${cat.id} (${cat.nome})`)

        // Atualizar associações de produtos para usar a categoria mantida
        const associations = await prisma.produtoCategoria.findMany({
          where: { categoriaId: cat.id }
        })

        if (associations.length > 0) {
          console.log(`    Atualizando ${associations.length} associações de produtos...`)
          for (const assoc of associations) {
            // Verificar se já existe uma associação com a categoria mantida
            const existing = await prisma.produtoCategoria.findFirst({
              where: {
                produtoId: assoc.produtoId,
                categoriaId: keep.id
              }
            })

            if (!existing) {
              await prisma.produtoCategoria.update({
                where: { produtoId_categoriaId: { produtoId: assoc.produtoId, categoriaId: assoc.categoriaId } },
                data: { categoriaId: keep.id }
              })
              updatedAssociationsCount++
            } else {
              // Deletar a associação duplicada
              await prisma.produtoCategoria.delete({
                where: { produtoId_categoriaId: { produtoId: assoc.produtoId, categoriaId: assoc.categoriaId } }
              })
              updatedAssociationsCount++
            }
          }
        }

        // Deletar a categoria
        await prisma.categoria.delete({
          where: { id: cat.id }
        })
        deletedCount++
      }
    }

    console.log(`\nResumo:`)
    console.log(`  Categorias deletadas: ${deletedCount}`)
    console.log(`  Associações atualizadas: ${updatedAssociationsCount}`)
    console.log(`\nScript concluído com sucesso!`)

  } catch (error) {
    console.error('Erro ao remover categorias duplicadas:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

removeDuplicateCategories()
