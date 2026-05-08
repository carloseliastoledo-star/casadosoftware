const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export async function generateAiChatReply(params: {
  customerMessage: string
  history: Array<{ sender: string; content: string }>
  conversation?: {
    customerName?: string | null
    customerEmail?: string | null
    orderNumber?: string | null
  }
}): Promise<string> {
  if (!OPENAI_API_KEY) {
    return 'No momento estou com instabilidade para responder automaticamente. Vou encaminhar seu atendimento para um atendente humano.'
  }

  const { customerMessage, history, conversation } = params

  const contextInfo: string[] = []
  if (conversation?.customerName) contextInfo.push(`Nome do cliente: ${conversation.customerName}`)
  if (conversation?.customerEmail) contextInfo.push(`Email: ${conversation.customerEmail}`)
  if (conversation?.orderNumber) contextInfo.push(`Número do pedido: ${conversation.orderNumber}`)

  const systemPrompt = `Você é o assistente virtual da Casa do Software, loja online de licenças digitais de software.

Objetivo:
Ajudar clientes antes e depois da compra, com linguagem simples, educada e objetiva.

Regras obrigatórias:
- Sempre fale em português brasileiro.
- Seja cordial, direto e profissional.
- Se o cliente já comprou, peça número do pedido e nome completo.
- Se for problema com Office 365, peça print do erro e oriente enviar para comercial@casadosoftware.com.br.
- Se o cliente pedir nota fiscal, peça os dados completos, número do pedido, valor pago e oriente confirmar pelo email comercial@casadosoftware.com.br.
- Nunca prometa reembolso automático.
- Nunca invente status de pedido.
- Nunca informe dados internos, fornecedores, margens ou estratégias da empresa.
- Nunca diga que verificou um pedido se o sistema não forneceu dados reais.
- Se o cliente estiver irritado, pedir reembolso, falar em Reclame Aqui, processo, chargeback, golpe, PROCON ou denúncia, diga que vai encaminhar para atendimento humano.
- Se não souber responder, encaminhe para humano.
- Não responda assuntos fora da Casa do Software.
- Não forneça orientação jurídica, financeira ou médica.
- Não peça dados sensíveis desnecessários.

Respostas padrão úteis:
- Para Office 365 com erro: peça número do pedido, nome completo e print do erro. Oriente enviar print para comercial@casadosoftware.com.br.
- Para nota fiscal: peça razão social/nome, CPF/CNPJ, endereço completo, e-mail, número do pedido e valor pago.
- Para compra: explique de forma simples e direcione para os produtos do site.
- Para falar com humano: informe que o atendimento será encaminhado.

A resposta deve ter no máximo 3 parágrafos curtos.

${contextInfo.length ? '\n\nInformações do cliente:\n' + contextInfo.join('\n') : ''}`

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt }
  ]

  const recentHistory = history.slice(-12)
  for (const msg of recentHistory) {
    const role = msg.sender === 'CUSTOMER' ? 'user' : msg.sender === 'AI' ? 'assistant' : 'user'
    messages.push({ role, content: msg.content })
  }

  messages.push({ role: 'user', content: customerMessage })

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('[openaiChat] OpenAI API error:', response.status, response.statusText)
      return 'No momento estou com instabilidade para responder automaticamente. Vou encaminhar seu atendimento para um atendente humano.'
    }

    const data = await response.json() as any
    const reply = data.choices?.[0]?.message?.content || 'No momento estou com instabilidade para responder automaticamente. Vou encaminhar seu atendimento para um atendente humano.'

    return reply.trim()
  } catch (error) {
    console.error('[openaiChat] Error calling OpenAI:', error)
    return 'No momento estou com instabilidade para responder automaticamente. Vou encaminhar seu atendimento para um atendente humano.'
  }
}
