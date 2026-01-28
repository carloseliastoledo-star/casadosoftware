import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.produto.deleteMany()

  await prisma.produto.createMany({
    data: [
      {
        nome: "Windows 11 Pro",
        slug: "windows-11-pro",
        descricao: "Licença digital Windows 11 Pro permanente para 1 PC.",
        preco: 149.90,
        imagem: "/windows-11-pro.jpg"
      },
      {
        nome: "Windows 10 Pro",
        slug: "windows-10-pro",
        descricao: "Windows 10 Pro permanente.",
        preco: 129.90,
        imagem: "/windows-10-pro.jpg"
      },
      {
        nome: "Office 2021 Pro Plus",
        slug: "office-2021-pro-plus",
        descricao: "Pacote Office 2021 completo permanente.",
        preco: 199.90,
        imagem: "/office-2021-pro.jpg"
      },
      {
        nome: "Office 365 Familiar",
        slug: "office-365-familiar",
        descricao: "Office 365 para até 6 pessoas.",
        preco: 179.90,
        imagem: "/office-365.jpg"
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
