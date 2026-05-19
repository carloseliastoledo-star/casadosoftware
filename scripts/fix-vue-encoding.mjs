import { readFileSync, writeFileSync } from 'fs'

const filePath = 'app/pages/produto/[slug].vue'

// Read the file
let content = readFileSync(filePath, 'utf8')

// Fix broken characters using the same patterns from fix-nome-encoding.mjs
const replacements = [
  // Emojis - more patterns
  ['Ô£ö', '✅'],
  ['Ô£à', ''],
  ['ÔÜí', ''],
  ['Ô¡É', ''],
  ['ƒöÑ', '🔥'],
  ['Æ', ''],
  ['ø', ''],
  ['­ƒ', '🛒'],
  ['­ƒö', '🔒'],
  ['­ƒ¼', '👥'],
  ['­ƒôº', '📧'],
  ['­ƒ░', '💳'],
  ['­🔥', '🔥'],
  ['Ôå®´©Å', '✅'],
  ['🛒ôº', '📧'],
  ['Ôå', '→'],
  
  // Em dash
  ['ÔÇô', '–'],
  
  // Portuguese characters (CP850 mojibake)
  ['├º', 'ç'],
  ['├ú', 'ã'],
  ['├ó', 'â'],
  ['├è', 'Ê'],
  ['├¡', 'í'],
  ['├³', 'ó'],
  ['├│', 'ó'],
  ['├Á', 'õ'],
  ['├é', 'ê'],
  ['├á', 'à'],
  ['├ã', 'ô'],
  ['├â', 'ò'],
  ['├®', 'é'],
  ['├¬', 'ê'],
  ['├í', 'á'],
  ['├Ë', 'É'],
  ['├ë', 'É'],
  ['├Í', 'Á'],
  ['├Î', 'Â'],
  ['├Ì', 'À'],
  ['├║', 'ú'],
  ['├┤', 'ô'],
  ['├Ç', 'À'],
  ['├ç', 'Ç'],
  ['├ô', 'Ó'],
  ['┬║', 'º'],
  
  // Additional patterns from user feedback
  ['­', ''],
]

for (const [broken, fixed] of replacements) {
  content = content.split(broken).join(fixed)
}

// Write back
writeFileSync(filePath, content, 'utf8')

console.log('Fixed encoding in app/pages/produto/[slug].vue')
console.log('Replacements made:', replacements.length)
