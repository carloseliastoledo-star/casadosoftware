type ProductTemplateInput = {
  nome?: string
  slug?: string
}

function normalizeSlug(slug?: string) {
  return String(slug || '')
    .trim()
    .toLowerCase()
}

export function getDefaultProductDescription(input: ProductTemplateInput) {
  const slug = normalizeSlug(input.slug)
  const nome = String(input.nome || '').trim() || 'Produto'

  if (slug === 'windows-11-pro' || slug.includes('windows-11-pro')) {
    return [
      'Produto digital. Licença ESD para 1 PC. Entrega por e-mail após confirmação do pagamento.',
      '',
      `O ${nome} é fornecido em formato digital. Após a confirmação do pagamento, você receberá por e-mail a chave de ativação digital (ESD) e orientações para instalação e ativação.`,
      '',
      'Inclui:',
      '- Chave de ativação digital (ESD) para 1 PC',
      '- Orientações de instalação e ativação',
      '- Suporte por e-mail',
      '',
      'Entrega:',
      '- Entrega digital por e-mail após confirmação do pagamento',
      '',
      'Políticas:',
      '- Consulte “Entrega Digital” e “Política de Reembolso” no rodapé do site'
    ].join('\n')
  }

  if (slug === 'windows-11-home' || slug.includes('windows-11-home')) {
    return [
      'Produto digital. Licença ESD para 1 PC. Envio por e-mail após confirmação do pagamento.',
      '',
      `O ${nome} é um produto digital. Após a confirmação do pagamento, você receberá por e-mail a chave de ativação digital (ESD) e instruções para instalação e ativação.`,
      '',
      'Inclui:',
      '- Chave de ativação digital (ESD) para 1 PC',
      '- Instruções de instalação e ativação',
      '- Suporte por e-mail',
      '',
      'Entrega:',
      '- Envio digital por e-mail após confirmação do pagamento',
      '',
      'Políticas:',
      '- Consulte “Entrega Digital” e “Política de Reembolso” no rodapé do site'
    ].join('\n')
  }

  if (slug === 'office-365' || slug.includes('office-365') || slug.includes('microsoft-365')) {
    return [
      'Assinatura anual (12 meses). Produto digital. Acesso via conta fornecida após a compra.',
      '',
      `${nome} é um produto digital com validade de 12 meses. Após a confirmação do pagamento, será fornecida uma conta de acesso para utilização do serviço pelo período contratado.`,
      'No primeiro acesso, o cliente deverá alterar a senha.',
      '',
      'Inclui:',
      '- Acesso válido por 12 meses (assinatura anual)',
      '- Conta de acesso (login e senha) fornecida após a compra',
      '- Troca de senha obrigatória no primeiro acesso',
      '- Ativação para até 5 dispositivos (PC, Mac, tablet e celular — iOS/Android)',
      '- Instruções de primeiro acesso',
      '- Suporte por e-mail',
      '',
      'Entrega:',
      '- Entrega digital após confirmação do pagamento',
      '',
      'Requisitos:',
      '- Acesso à internet e dispositivo compatível',
      '',
      'Políticas:',
      '- Consulte “Entrega Digital” e “Política de Reembolso” no rodapé do site'
    ].join('\n')
  }

  return [
    'Produto digital. Entrega por e-mail após confirmação do pagamento.',
    '',
    `O ${nome} é disponibilizado em formato digital. As condições de entrega e uso constam na página do produto.`,
    '',
    'Políticas:',
    '- Consulte “Entrega Digital” e “Política de Reembolso” no rodapé do site'
  ].join('\n')
}
