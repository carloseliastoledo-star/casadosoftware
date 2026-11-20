const HUMAN_TRANSFER_KEYWORDS = [
  'reembolso',
  'chargeback',
  'reclame aqui',
  'processo',
  'golpe',
  'cancelar',
  'denunciar',
  'não recebi',
  'nao recebi',
  'licença inválida',
  'licenca invalida',
  'quero humano',
  'atendente',
  'falar com pessoa',
  'procon',
  'advogado',
  'atendimento humano',
  'encaminhar atendente',
  'encaminhar humano',
  'falar com humano',
  'preciso de atendente',
  'aguardando atendimento',
  'aguardando atendimento humano'
]

export function shouldTransferToHuman(message: string): boolean {
  const lowerMessage = String(message || '').toLowerCase().trim()
  if (lowerMessage === '5' || HUMAN_TRANSFER_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) return true
  const genericFailure = /n[ãa]o (?:est[aá] )?funcion/.test(lowerMessage)
  return genericFailure && !/\b(?:office|microsoft)\s*365\b/.test(lowerMessage)
}

export function getInitialAssistantMessage(): string {
  return `Olá! 👋 Seja bem-vindo à Casa do Software.

Sou o assistente virtual e vou te ajudar a resolver mais rápido.

Por gentileza, escolha uma opção:

1️⃣ Quero comprar uma licença
2️⃣ Já comprei e preciso de suporte
3️⃣ Problema com Office 365
4️⃣ Preciso de nota fiscal
5️⃣ Falar com atendente humano`
}
