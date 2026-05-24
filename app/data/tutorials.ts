export const tutorials = {
  // ======================================
  // WINDOWS 10 PRO (BASE)
  // ======================================
  'windows-10-pro': {
    title: 'Como Ativar Windows 10 Pro por Telefone',
    subtitle:
      'Guia completo passo a passo para ativar o Windows 10 Pro usando o método de ativação telefônica da Microsoft',
    date: '9 de novembro de 2025',

    productInfo:
      'Você receberá 1 chave de ativação do Windows 10 Pro que pode ativar 1 PC através do método de ativação telefônica da Microsoft.',

    warning:
      'Ativação única – Não garantimos a reativação após a formatação do computador.',

    guarantees: [
      'Atendimento ao cliente amigável e profissional',
      'Entrega rápida e prática através do painel de controle da loja virtual',
      'Receba notificações sobre o status do pedido por e-mail',
      'Acesse Minha Conta → Ver Pedidos',
      'Garantia de substituição individual de 7 dias',
      'Licenças 100% autênticas garantidas'
    ],

    attention:
      'Certifique-se de comprar a versão correta. Não aceitamos devoluções após a entrega.',

    downloadLink: {
      label: 'Microsoft Software Download Listing',
      url: 'https://www.microsoft.com/software-download'
    },

    steps: [
      {
        title: 'Recebendo sua Chave',
        content:
          'Após a compra, você receberá sua chave por e-mail. Acesse Minha Conta → Ver Pedidos para visualizá-la.'
      },
      {
        title: 'Acessando as Configurações de Ativação',
        content:
          'Pressione Windows + I → Sistema → Ativação.'
      },
      {
        title: 'Inserindo sua Chave de Produto',
        content:
          'Digite sua chave. Se ocorrer erro, continue — isso é normal para ativação por telefone.'
      },
      {
        title: 'Abrindo o Assistente de Ativação por Telefone',
        content:
          'Pressione Windows + R → Digite slui.exe 4 → Enter.'
      },
      {
        title: 'Selecionando País ou Região',
        content:
          'Escolha seu país e clique em Próximo.'
      },
      {
        title: 'Obtendo o ID de Confirmação',
        content:
          'Ligue para o número exibido ou use o site getcid.us para obter o ID de confirmação.'
      },
      {
        title: 'Inserindo o ID de Confirmação',
        content:
          'Digite o ID de confirmação e conclua a ativação.'
      }
    ],

    tips: [
      'A chave é válida para apenas 1 PC',
      'O ID de instalação muda a cada tentativa',
      'O método online costuma ser mais rápido',
      'Guarde sua chave e ID de confirmação'
    ]
  },

  // ======================================
  // WINDOWS 11 PRO (REAPROVEITA O MESMO)
  // ======================================
  'windows-11-pro': {
    extends: 'windows-10-pro'
  },

  // ======================================
  // OFFICE 2021 PRO PLUS
  // ======================================
  'office-2021-pro': {
    title: 'Como Ativar Office 2021 Pro Plus por Telefone',
    subtitle:
      'Guia completo passo a passo para ativar o Office 2021 Pro Plus usando o método de ativação telefônica da Microsoft',
    date: '11 de janeiro de 2025',

    productInfo:
      'Você receberá 1 chave do Office 2021 Pro Plus que pode ativar 1 PC através do método de ativação por telefone.',

    warning:
      'Ativação única – Não garantimos a reativação após a formatação do computador. Esta chave é válida apenas para PC (não funciona em Mac).',

    applications: [
      'Word',
      'Excel',
      'PowerPoint',
      'Access',
      'OneNote',
      'Outlook',
      'Publisher'
    ],

    guarantees: [
      'Atendimento ao cliente amigável e profissional',
      'Entrega rápida e prática através do painel de controle da loja virtual',
      'Notificações automáticas por e-mail',
      'Acesso em Minha Conta → Ver Pedidos',
      'Garantia de substituição individual de 7 dias',
      'Licenças 100% autênticas garantidas'
    ],

    attention:
      'Certifique-se de comprar a versão/edição correta. Não aceitamos devoluções após a entrega.',

    downloadLinks: [
      {
        label: 'Download Office 2021 Pro Plus x64 (Windows 64 bits)',
        url: '#'
      },
      {
        label: 'Download Office 2021 Pro Plus x86 (Windows 32 bits)',
        url: '#'
      }
    ],

    systemCheck:
      'Pressione Windows + I → Sistema → Sobre → Verifique se é 64 bits ou 32 bits.',

    steps: [
      {
        title: 'Recebendo sua Chave',
        content:
          'Você receberá sua chave por e-mail. Acesse Minha Conta → Ver Pedidos.'
      },
      {
        title: 'Instalando o Office 2021 Pro Plus',
        content:
          'Baixe o instalador correto (x64 ou x86), execute e aguarde a instalação.'
      },
      {
        title: 'Abrindo as Configurações de Ativação',
        content:
          'Abra um aplicativo do Office → Arquivo → Conta → Ativar Produto.'
      },
      {
        title: 'Inserindo sua Chave de Produto',
        content:
          'Digite sua chave e selecione ativação por telefone.'
      },
      {
        title: 'Selecionando País ou Região',
        content:
          'Escolha o país e clique em Próximo.'
      },
      {
        title: 'Obtendo o ID de Confirmação',
        content:
          'Use ligação telefônica ou o site getcid.us para obter o ID.'
      },
      {
        title: 'Inserindo o ID de Confirmação',
        content:
          'Digite o ID de confirmação e finalize a ativação.'
      }
    ],

    tips: [
      'Funciona apenas em Windows',
      'A chave é válida para apenas 1 PC',
      'O método online é mais rápido',
      'Guarde sua chave e o ID de confirmação'
    ]
  },

  // ======================================
  // OFFICE 365
  // ======================================
  'office-365': {
    title: 'Como Instalar o Office 365 com Microsoft Authenticator',
    subtitle:
      'Aprenda como instalar o Office 365, acessar sua conta Microsoft, configurar o Microsoft Authenticator e ativar Word, Excel, PowerPoint e Outlook',
    date: '24 de maio de 2026',

    productInfo:
      'Você receberá 1 conta do Office 365 que pode ser usada em até 5 dispositivos simultaneamente (PC, Mac, iOS e Android).',

    warning:
      'Assinatura vitalícia com acesso contínuo. Válido para 5 dispositivos simultâneos. Inclui 1 TB de armazenamento no OneDrive. Requer conta Microsoft para ativação.',

    applications: [
      'Word',
      'Excel',
      'PowerPoint',
      'Outlook',
      'OneNote',
      'Publisher',
      'Access',
      'OneDrive (1 TB)',
      'Teams'
    ],

    guarantees: [
      'Atendimento ao cliente amigável e profissional',
      'Entrega rápida via painel da loja',
      'Notificações por e-mail sobre seu pedido',
      'Acesso em Minha Conta → Ver Pedidos',
      'Garantia de substituição individual de 7 dias',
      'Contas 100% autênticas'
    ],

    attention:
      'Certifique-se de comprar a versão correta. Não aceitamos devoluções após a entrega.',

    downloadLinks: [
      {
        label: 'Site oficial da Microsoft',
        url: 'https://www.office.com'
      },
      {
        label: 'Portal de conta Microsoft',
        url: 'https://account.microsoft.com'
      }
    ],

    systemCheck:
      'O Office 365 está disponível para Windows, Mac, iOS e Android.',

    steps: [
      {
        title: 'Recebendo sua Conta',
        content:
          'Após a compra, acesse Minha Conta → Ver Pedidos para obter e-mail e senha da conta Microsoft.'
      },
      {
        title: 'Acessando a Conta Microsoft',
        content:
          'Acesse account.microsoft.com e faça login com as credenciais fornecidas.'
      },
      {
        title: 'Configurando a Autenticação',
        content:
          'Será solicitado configurar a autenticação de dois fatores para segurança da conta.'
      },
      {
        title: 'Instalando o Microsoft Authenticator',
        content:
          'Baixe o app Microsoft Authenticator no seu celular (iOS ou Android).'
      },
      {
        title: 'Adicionando a Conta no Authenticator',
        content:
          'Escaneie o QR Code ou insira o código manualmente para vincular a conta.'
      },
      {
        title: 'Instalando o Office no PC',
        content:
          'Acesse office.com, faça login e clique em "Instalar Office".'
      },
      {
        title: 'Executando o Instalador',
        content:
          'Baixe e execute o instalador do Office no seu computador.'
      },
      {
        title: 'Ativando os Aplicativos',
        content:
          'Abra qualquer aplicativo do Office (Word, Excel, etc.) e faça login com a conta.'
      },
      {
        title: 'Verificando a Ativação',
        content:
          'Vá em Arquivo → Conta e confirme que o produto está ativado.'
      },
      {
        title: 'Instalando em Outros Dispositivos',
        content:
          'Repita o processo em até 5 dispositivos adicionais.'
      }
    ],

    tips: [
      'Mantenha o Microsoft Authenticator sempre atualizado',
      'Não compartilhe suas credenciais com terceiros',
      'Use uma senha forte para sua conta Microsoft',
      'Ative a verificação em duas etapas para maior segurança',
      'Guarde as informações de recuperação da conta'
    ]
  }
}
