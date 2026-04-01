import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mojibake lookup: broken pair → correct Portuguese char
// All patterns confirmed from raw HEX inspection of the Railway MySQL data
const MOJIBAKE = {
  '\u251C\u00BA': '\u00E7',  // ├º → ç  (Licença)
  '\u251C\u00FA': '\u00E3',  // ├ú → ã  (Ativação)
  '\u251C\u00F3': '\u00E2',  // ├ó → â  (Instantânea)
  '\u251C\u00E8': '\u00CA',  // ├è → Ê  (PORTUGUÊS)
  '\u251C\u00A1': '\u00ED',  // ├¡ → í  (Vitalícia)
  '\u251C\u00B3': '\u00F3',  // ├³ → ó  (após, outros)
  '\u251C\u2502': '\u00F3',  // ├│ → ó  (após - variante com │)
  '\u251C\u00C1': '\u00F5',  // ├Á → õ  (Atualizações)
  '\u251C\u00E9': '\u00EA',  // ├é → ê  (português minúsculo)
  '\u251C\u00E1': '\u00E0',  // ├á → à  (à)
  '\u251C\u00E3': '\u00F4',  // ├ã → ô  (ô)
  '\u251C\u00E2': '\u00F2',  // ├â → ò  (ò)
  '\u251C\u00AE': '\u00E9',  // ├® → é  (é)
  '\u251C\u00AC': '\u00EA',  // ├¬ → ê  (você, português)
  '\u251C\u00ED': '\u00E1',  // ├í → á  (já, Grátis)
  '\u251C\u00CB': '\u00C9',  // ├Ë → É  (É confiável?)
  '\u251C\u00EB': '\u00C9',  // ├ë → É  (variante minúscula)
  '\u251C\u00CD': '\u00C1',  // ├Í → Á  (Á maiúsculo)
  '\u251C\u00CE': '\u00C2',  // ├Î → Â  (Â maiúsculo)
  '\u251C\u00CC': '\u00C0',  // ├Ì → À  (À maiúsculo)
}

const MOJIBAKE_REGEX = new RegExp(
  Object.keys(MOJIBAKE).map(k =>
    k.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).join('')
  ).join('|'),
  'g'
)

function fix(s) {
  if (!s || !/\u251C/.test(s)) return s
  return s.replace(MOJIBAKE_REGEX, m => MOJIBAKE[m] ?? m)
}

async function fixField(table, field, records) {
  let count = 0
  for (const r of records) {
    const val = r[field]
    if (!val) continue
    const corrected = fix(val)
    if (corrected !== val) {
      console.log(`  [${field}] "${val.slice(0,60)}" → "${corrected.slice(0,60)}"`)
      await prisma.$executeRawUnsafe(
        `UPDATE ${table} SET ${field} = ? WHERE id = ?`,
        corrected, r.id
      )
      count++
    }
  }
  return count
}

async function main() {
  const products = await prisma.produto.findMany({
    select: {
      id: true, nome: true, descricao: true, descricaoEn: true,
      cardItems: true, tutorialTitulo: true, tutorialSubtitulo: true, tutorialConteudo: true,
    }
  })

  console.log(`\n=== Checking ${products.length} products ===\n`)

  const nullDescricao = products.filter(p => p.descricao === null).length
  const nullCards = products.filter(p => p.cardItems === null).length
  console.log(`descricao NULL: ${nullDescricao}/${products.length}`)
  console.log(`cardItems NULL: ${nullCards}/${products.length}`)

  let total = 0
  total += await fixField('Produto', 'nome', products)
  total += await fixField('Produto', 'descricao', products)
  total += await fixField('Produto', 'cardItems', products)
  total += await fixField('Produto', 'tutorialTitulo', products)
  total += await fixField('Produto', 'tutorialSubtitulo', products)
  total += await fixField('Produto', 'tutorialConteudo', products)

  // Fix BlogPost table
  const blogPosts = await prisma.blogPost.findMany({
    select: { id: true, titulo: true, excerpt: true }
  })
  console.log(`\n=== Checking ${blogPosts.length} blog posts ===\n`)
  total += await fixField('BlogPost', 'titulo', blogPosts)
  total += await fixField('BlogPost', 'excerpt', blogPosts)

  // Fix BlogPostTranslation table
  const blogTranslations = await prisma.blogPostTranslation.findMany({
    select: { id: true, titulo: true, excerpt: true }
  })
  console.log(`\n=== Checking ${blogTranslations.length} blog translations ===\n`)
  total += await fixField('BlogPostTranslation', 'titulo', blogTranslations)
  total += await fixField('BlogPostTranslation', 'excerpt', blogTranslations)

  console.log(`\nTotal fixed: ${total} fields.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
