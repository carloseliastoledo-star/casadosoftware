import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.produto.deleteMany()

  await prisma.produto.createMany({
    data: [
      {
        nome: 'Windows 10 Pro',
        slug: 'windows-10-pro',
        descricao: 'Licença original vitalícia para 1 PC',
        preco: 199.9,
        imagem: '/images/produto/windows-10-pro.jpg'
      },
      {
        nome: 'Windows 11 Pro',
        slug: 'windows-11-pro',
        descricao: 'Licença original vitalícia para 1 PC',
        preco: 299.9,
        imagem: '/images/produto/windows-11-pro.jpg'
      },
      {
        nome: 'Office 2021 Pro Plus',
        slug: 'office-2021-pro-plus',
        descricao: 'Pacote Office completo sem mensalidade',
        preco: 189.9,
        imagem: '/images/produto/office-2021-pro.jpg'
      },
      {
        nome: 'Office 365',
        slug: 'office-365',
        descricao: 'Assinatura anual Microsoft Office 365',
        preco: 119.9,
        imagem: '/images/produto/office-365.jpg'
      }
    ]
  })
}

main()
  .then(() => console.log('Seed executado com sucesso'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())
