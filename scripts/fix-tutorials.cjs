const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const tutorials = [
  {
    slug: 'windows-11-pro',
    nome: 'Windows 11 Pro',
    tutorialTitulo: 'Como Instalar e Ativar o Windows 11 Pro',
    tutorialConteudo: `Sobre o Produto
Você receberá 1 chave do Windows 11 Pro que pode ativar 1 PC através do método de ativação digital da Microsoft.

Importante:
• Ativação digital vinculada à conta Microsoft
• Válido para PC (Windows 11)
• Requer conexão com internet para ativação inicial

Recursos incluídos: Interface moderna, segurança aprimorada, suporte a multitarefa, integração com Android, e muito mais.

Garantias e Suporte
• Atendimento ao cliente amigável e profissional
• Entrega rápida via painel da loja
• Notificações por e-mail sobre seu pedido
• Acesso em Minha Conta >> Ver Pedidos
• Garantia de substituição individual de 7 dias
• Licenças 100% autênticas

Links para Download
Antes de ativar, é necessário baixar e instalar o Windows 11 Pro.

• Site oficial da Microsoft: https://www.microsoft.com/pt-br/software-download/windows11
• Media Creation Tool: https://www.microsoft.com/pt-br/software-download/windows11

Verifique os requisitos mínimos: Processador de 1 GHz, 4 GB de RAM, 64 GB de armazenamento, e TPM 2.0.

Passo a Passo — Instalação e Ativação
1. Recebendo sua chave: Após a compra, acesse Minha Conta → Ver Pedidos para obter sua chave.
2. Baixando o Windows 11: Acesse o site oficial da Microsoft e baixe o instalador ou a ISO.
3. Criando mídia de instalação: Use a Media Creation Tool para criar um USB bootável ou grave a ISO em DVD.
4. Instalando o Windows 11: Dê boot pelo USB/DVD, siga o assistente de instalação e escolha a edição Pro.
5. Configuração inicial: Complete a configuração do Windows (conta, privacidade, etc.).
6. Abrindo configurações de ativação: Configurações → Sistema → Ativação.
7. Inserindo a chave: Clique em "Alterar chave do produto" e insira sua chave do Windows 11 Pro.
8. Ativando: O Windows se conectará aos servidores da Microsoft e ativará automaticamente.
9. Vinculando à conta Microsoft: Faça login com sua conta Microsoft para vincular a licença digitalmente.
10. Confirmação: O Windows será ativado com sucesso e você verá "Windows está ativado".

Dicas Importantes
• Verifique se seu PC atende aos requisitos do Windows 11
• Faça backup de seus arquivos antes de instalar
• Use uma conexão estável durante a ativação
• A licença digital permite reinstalação após formatação
• Guarde sua chave em local seguro

Requisitos Mínimos do Windows 11
• Processador: 1 GHz ou mais rápido, 2 núcleos
• RAM: 4 GB ou mais
• Armazenamento: 64 GB ou mais
• TPM: Versão 2.0
• Placa de vídeo: DirectX 12 ou superior
• Tela: HD (720p) ou superior`
  },
  {
    slug: 'windows-10-pro',
    nome: 'Windows 10 Pro',
    tutorialTitulo: 'Como Instalar e Ativar o Windows 10 Pro',
    tutorialConteudo: `Sobre o Produto
Você receberá 1 chave do Windows 10 Pro que pode ativar 1 PC através do método de ativação digital da Microsoft.

Importante:
• Ativação digital vinculada à conta Microsoft
• Válido para PC (Windows 10)
• Requer conexão com internet para ativação inicial

Recursos incluídos: Segurança avançada, BitLocker, Hyper-V, Remote Desktop, e muito mais.

Garantias e Suporte
• Atendimento ao cliente amigável e profissional
• Entrega rápida via painel da loja
• Notificações por e-mail sobre seu pedido
• Acesso em Minha Conta >> Ver Pedidos
• Garantia de substituição individual de 7 dias
• Licenças 100% autênticas

Links para Download
Antes de ativar, é necessário baixar e instalar o Windows 10 Pro.

• Site oficial da Microsoft: https://www.microsoft.com/pt-br/software-download/windows10
• Media Creation Tool: https://www.microsoft.com/pt-br/software-download/windows10

Verifique os requisitos mínimos: Processador de 1 GHz, 1 GB de RAM (32-bit) ou 2 GB (64-bit), 16 GB de armazenamento.

Passo a Passo — Instalação e Ativação
1. Recebendo sua chave: Após a compra, acesse Minha Conta → Ver Pedidos para obter sua chave.
2. Baixando o Windows 10: Acesse o site oficial da Microsoft e baixe o instalador ou a ISO.
3. Criando mídia de instalação: Use a Media Creation Tool para criar um USB bootável ou grave a ISO em DVD.
4. Instalando o Windows 10: Dê boot pelo USB/DVD, siga o assistente de instalação e escolha a edição Pro.
5. Configuração inicial: Complete a configuração do Windows (conta, privacidade, etc.).
6. Abrindo configurações de ativação: Configurações → Atualização e Segurança → Ativação.
7. Inserindo a chave: Clique em "Alterar chave do produto" e insira sua chave do Windows 10 Pro.
8. Ativando: O Windows se conectará aos servidores da Microsoft e ativará automaticamente.
9. Vinculando à conta Microsoft: Faça login com sua conta Microsoft para vincular a licença digitalmente.
10. Confirmação: O Windows será ativado com sucesso e você verá "Windows está ativado".

Dicas Importantes
• Verifique se seu PC atende aos requisitos do Windows 10
• Faça backup de seus arquivos antes de instalar
• Use uma conexão estável durante a ativação
• A licença digital permite reinstalação após formatação
• Guarde sua chave em local seguro

Requisitos Mínimos do Windows 10
• Processador: 1 GHz ou mais rápido
• RAM: 1 GB (32-bit) ou 2 GB (64-bit)
• Armazenamento: 16 GB ou mais
• Placa de vídeo: DirectX 9 ou superior
• Tela: 800x600 ou superior
• Internet: Para ativação e atualizações`
  },
  {
    slug: 'office-365',
    nome: 'Office 365',
    tutorialTitulo: 'Como Instalar o Office 365 com Microsoft Authenticator',
    tutorialConteudo: `Sobre o Produto
Você receberá 1 conta do Office 365 que pode ser usada em até 5 dispositivos simultaneamente (PC, Mac, iOS e Android).

Importante:
• Assinatura vitalícia com acesso contínuo
• Válido para 5 dispositivos simultâneos
• Inclui 1 TB de armazenamento no OneDrive
• Requer conta Microsoft para ativação

Aplicativos incluídos: Word, Excel, PowerPoint, Outlook, OneNote, Publisher, Access, e muito mais.

Garantias e Suporte
• Atendimento ao cliente amigável e profissional
• Entrega rápida via painel da loja
• Notificações por e-mail sobre seu pedido
• Acesso em Minha Conta >> Ver Pedidos
• Garantia de substituição individual de 7 dias
• Contas 100% autênticas

Links para Download
Antes de ativar, é necessário instalar o Office 365 no seu dispositivo.

• Site oficial da Microsoft: https://www.office.com
• Portal de conta Microsoft: https://account.microsoft.com

O Office 365 está disponível para Windows, Mac, iOS e Android.

Passo a Passo — Instalação e Ativação
1. Recebendo sua conta: Após a compra, acesse Minha Conta → Ver Pedidos para obter e-mail e senha da conta Microsoft.
2. Acessando a conta Microsoft: Acesse account.microsoft.com e faça login com as credenciais fornecidas.
3. Configurando a autenticação: Será solicitado configurar a autenticação de dois fatores para segurança da conta.
4. Instalando o Microsoft Authenticator: Baixe o app Microsoft Authenticator no seu celular (iOS ou Android).
5. Adicionando a conta no Authenticator: Escaneie o QR Code ou insira o código manualmente para vincular a conta.
6. Instalando o Office no PC: Acesse office.com, faça login e clique em "Instalar Office".
7. Executando o instalador: Baixe e execute o instalador do Office no seu computador.
8. Ativando os aplicativos: Abra qualquer aplicativo do Office (Word, Excel, etc.) e faça login com a conta.
9. Verificando a ativação: Vá em Arquivo → Conta e confirme que o produto está ativado.
10. Instalando em outros dispositivos: Repita o processo em até 5 dispositivos adicionais.

Dicas Importantes
• Mantenha o Microsoft Authenticator sempre atualizado
• Não compartilhe suas credenciais com terceiros
• Use uma senha forte para sua conta Microsoft
• Ative a verificação em duas etapas para maior segurança
• Guarde as informações de recuperação da conta

Aplicativos Incluídos no Office 365
• Word
• Excel
• PowerPoint
• Outlook
• OneNote
• Publisher
• Access
• OneDrive (1 TB)
• Teams
• E muito mais`
  }
]

async function main() {
  console.log('=== Fixando Tutoriais ===\n')

  for (const tutorial of tutorials) {
    console.log(`Verificando produto: ${tutorial.slug}`)
    
    const existing = await prisma.produto.findFirst({
      where: { slug: tutorial.slug }
    })

    if (existing) {
      console.log(`  Produto encontrado: ${existing.nome}`)
      console.log(`  Atualizando campos de tutorial...`)
      
      await prisma.produto.update({
        where: { id: existing.id },
        data: {
          tutorialTitulo: tutorial.tutorialTitulo,
          tutorialConteudo: tutorial.tutorialConteudo
        }
      })
      
      console.log(`  ✓ Produto atualizado\n`)
    } else {
      console.log(`  Produto não encontrado`)
      console.log(`  Criando novo produto...`)
      
      await prisma.produto.create({
        data: {
          slug: tutorial.slug,
          nome: tutorial.nome,
          tutorialTitulo: tutorial.tutorialTitulo,
          tutorialConteudo: tutorial.tutorialConteudo,
          preco: 199,
          ativo: true
        }
      })
      
      console.log(`  ✓ Produto criado\n`)
    }
  }

  console.log('=== Concluído ===')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
