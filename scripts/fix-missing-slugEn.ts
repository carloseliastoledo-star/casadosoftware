import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== CORRIGINDO PRODUTOS SEM SLUGEN ===\n')
  
  // Lista dos 4 produtos sem slugEn com slugs em inglês manuais
  const corrections = [
    {
      nome: 'Office 365 Personal, Digital, 1TB, 1 licença - Microsoft',
      slug: 'office-365-personal-digital-1tb-1-licenca-microsoft',
      slugEn: 'office-365-personal-digital-1tb-1-license'
    },
    {
      nome: 'Microsoft Office 365 – 5 Licenses (PC, Mac, Android, or iOS)',
      slug: 'microsoft-office-365-vitalicio-5-licenses-pc-mac-android-ou-ios-1-tb-one-drive',
      slugEn: 'microsoft-office-365-5-licenses-pc-mac-android-ios-1tb-onedrive'
    },
    {
      nome: 'Windows Server 2025 Standard 64 Bits, 16 Core ESD',
      slug: 'winserver2025',
      slugEn: 'windows-server-2025-standard-64-bit-16-core-esd'
    },
    {
      nome: 'Kaspersky Premium - 1, 3, 5 or 10 Devices - 1 Year',
      slug: 'kaspersky-premium-1-3-5-ou-10-dispositivos-1-ano',
      slugEn: 'kaspersky-premium-1-3-5-10-devices-1-year'
    }
  ]
  
  for (const correction of corrections) {
    console.log(`Atualizando: ${correction.nome}`)
    console.log(`  slug: ${correction.slug}`)
    console.log(`  slugEn: ${correction.slugEn}`)
    
    await prisma.produto.update({
      where: { slug: correction.slug },
      data: { slugEn: correction.slugEn }
    })
    
    console.log(`  ✅ Atualizado\n`)
  }
  
  console.log('=== CORREÇÃO CONCLUÍDA ===')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
