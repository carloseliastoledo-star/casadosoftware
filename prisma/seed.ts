import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.produto.deleteMany()

  await prisma.produto.createMany({
    data: [
      {
        nome: "Windows 11 Pro",
        slug: "windows-11-pro",
        descricao: "Licença original Windows 11 Pro vitalícia para 1 PC.",
        preco: 149.90,
        imagem: "/images/windows-11-pro.png"
      },
      {
        nome: "Windows 10 Pro",
        slug: "windows-10-pro",
        descricao: "Windows 10 Pro original vitalício.",
        preco: 129.90,
        imagem: "/images/windows-10-pro.png"
      },
      {
        nome: "Office 2021 Pro Plus",
        slug: "office-2021-pro-plus",
        descricao: "Pacote Office 2021 completo vitalício.",
        preco: 199.90,
        imagem: "/images/office-2021.png"
      },
      {
        nome: "Office 365 Familiar",
        slug: "office-365-familiar",
        descricao: "Office 365 para até 6 pessoas.",
        preco: 179.90,
        imagem: "/images/office-365.png"
      }
    ]
  })

  console.log("✅ Produtos inseridos com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
