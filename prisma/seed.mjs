import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.produto.deleteMany()

  await prisma.produto.createMany({
    data: [
      {
        nome: 'Windows 11 Pro',
        slug: 'windows-11-pro',
        descricao: 'Licença digital Windows 11 Pro permanente para 1 PC.',
        preco: 149.90,
        imagem: '/windows-11-pro.jpg',
        tutorialTitulo: 'Tutorial de Ativação',
        tutorialSubtitulo: 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
        tutorialConteudo: 'Passo a passo:\n1. Abra as configurações do Windows\n2. Vá em Sistema > Ativação\n3. Insira a chave do produto\n4. Conclua a ativação seguindo as instruções na tela'
      },
      {
        nome: 'Windows 10 Pro',
        slug: 'windows-10-pro',
        descricao: 'Windows 10 Pro permanente.',
        preco: 129.90,
        imagem: '/windows-10-pro.jpg',
        tutorialTitulo: 'Tutorial de Ativação',
        tutorialSubtitulo: 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
        tutorialConteudo: 'Passo a passo:\n1. Abra as configurações do Windows\n2. Vá em Atualização e Segurança > Ativação\n3. Insira a chave do produto\n4. Conclua a ativação'
      },
      {
        nome: 'Office 2021 Pro Plus',
        slug: 'office-2021-pro-plus',
        descricao: 'Pacote Office 2021 completo permanente.',
        preco: 199.90,
        imagem: '/office-2021-pro.jpg',
        tutorialTitulo: 'Tutorial de Ativação',
        tutorialSubtitulo: 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
        tutorialConteudo: 'Passo a passo:\n1. Abra Word ou Excel\n2. Arquivo > Conta\n3. Ativar Produto\n4. Insira a chave e conclua'
      },
      {
        nome: 'Office 365 Familiar',
        slug: 'office-365-familiar',
        descricao: 'Office 365 para até 6 pessoas.',
        preco: 179.90,
        imagem: '/office-365.jpg',
        tutorialTitulo: 'Tutorial de Ativação',
        tutorialSubtitulo: 'Aprenda como ativar seu produto passo a passo com nosso guia completo e detalhado.',
        tutorialConteudo: 'Passo a passo:\n1. Acesse account.microsoft.com\n2. Entre com a conta\n3. Resgatar/instalar o Office\n4. Conclua a instalação'
      }
    ]
  })

  console.log('✅ Produtos inseridos com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
