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
  'não funciona',
  'nao funciona',
  'quero humano',
  'atendente',
  'falar com pessoa',
  'procon',
  'advogado'
]

export function shouldTransferToHuman(message: string): boolean {
  const lowerMessage = String(message || '').toLowerCase().trim()
  return HUMAN_TRANSFER_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
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
