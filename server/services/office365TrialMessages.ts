export interface Office365TrialLead {
  id: string
  name: string
  email: string
  whatsapp: string
  usageType: string
  systemType: string
  status: string
  trialStartAt: Date
  trialExpiresAt: Date
  checkoutUrl?: string
  microsoftLogin?: string
  temporaryPassword?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export function generateDeliveryMessage(lead: Office365TrialLead, tutorialUrl: string): string {
  const expiresAt = lead.trialExpiresAt 
    ? new Date(lead.trialExpiresAt).toLocaleDateString('pt-BR') 
    : 'data a definir'

  return `Olá, ${lead.name}. Seu teste do Office 365 foi liberado por 7 dias.

Login: ${lead.microsoftLogin || 'a definir'}
Senha provisória: ${lead.temporaryPassword || 'a definir'}

Ao entrar pela primeira vez, a Microsoft pode solicitar alteração de senha e autenticação pelo Microsoft Authenticator.

Tutorial de instalação: ${tutorialUrl}

Seu teste é válido até ${expiresAt}.`
}

export function generateDay5Message(lead: Office365TrialLead): string {
  return `Olá, ${lead.name}. Seu teste do Office 365 termina em 2 dias. Para continuar usando sem interrupção, finalize o pagamento pelo link abaixo:
${lead.checkoutUrl || 'link a definir'}`
}

export function generateDay7Message(lead: Office365TrialLead): string {
  return `Olá, ${lead.name}. Seu teste gratuito termina hoje. Para manter seu acesso ativo, finalize o pagamento:
${lead.checkoutUrl || 'link a definir'}

Caso não deseje continuar, o acesso poderá ser encerrado automaticamente.`
}

export function generatePostExpirationMessage(lead: Office365TrialLead): string {
  return `Olá, ${lead.name}. Seu teste expirou, mas ainda podemos reativar seu acesso. Para continuar usando o Office 365, finalize o pagamento:
${lead.checkoutUrl || 'link a definir'}`
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
}

export function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
}
