<template>
  <section class="py-12 md:py-16">
    <div class="max-w-5xl mx-auto px-6">
      <div class="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div class="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-white border-b">
          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">
              <div class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Licenças Digitais</div>
              <h1 class="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">Atendimento e Políticas</h1>
              <p class="mt-4 text-gray-700 leading-relaxed max-w-3xl">
                Aqui você encontra informações sobre entrega digital, suporte e critérios de análise para reembolso e trocas.
                Nosso compromisso é atuar com clareza, transparência e atendimento responsável.
              </p>
            </div>

            <div class="hidden md:block shrink-0">
              <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold">
                LD
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 md:p-12 space-y-10">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="rounded-2xl border bg-white p-6">
              <h2 class="text-xl font-bold text-gray-900">Entrega digital</h2>
              <p class="mt-3 text-sm text-gray-700 leading-relaxed">
                A entrega é realizada de forma digital, após confirmação do pagamento. Dependendo do produto, você poderá receber chave/código
                (quando aplicável) e/ou instruções de ativação.
              </p>
              <ul class="mt-4 text-sm text-gray-700 list-disc pl-5 space-y-2">
                <li>Envio após confirmação do pagamento</li>
                <li>Conteúdo e instruções variam conforme o produto</li>
                <li>Em caso de dúvidas, o suporte pode orientar</li>
              </ul>
            </div>

            <div class="rounded-2xl border bg-white p-6">
              <h2 class="text-xl font-bold text-gray-900">Atendimento</h2>
              <p class="mt-3 text-sm text-gray-700 leading-relaxed">
                Nosso atendimento está disponível para orientar sobre compatibilidade, ativação e dúvidas relacionadas à entrega.
                Recomendamos entrar em contato antes da compra quando houver qualquer incerteza sobre requisitos.
              </p>
              <div class="mt-4 grid gap-3">
                <div class="rounded-xl border bg-gray-50 p-4">
                  <div class="text-xs font-semibold text-gray-600 uppercase">E-mail</div>
                  <div class="mt-1 text-sm text-gray-900 break-all">{{ supportEmail || 'Consulte no rodapé do site' }}</div>
                </div>
                <div class="rounded-xl border bg-gray-50 p-4">
                  <div class="text-xs font-semibold text-gray-600 uppercase">WhatsApp</div>
                  <div class="mt-1 text-sm text-gray-900 break-all">{{ whatsappLabel }}</div>
                </div>
                <div class="rounded-xl border bg-gray-50 p-4">
                  <div class="text-xs font-semibold text-gray-600 uppercase">Dados da empresa</div>
                  <div class="mt-1 text-sm text-gray-900 space-y-1">
                    <div><span class="font-semibold">Razão Social:</span> {{ companyLegalName }}</div>
                    <div><span class="font-semibold">CNPJ:</span> {{ companyCnpj }}</div>
                    <div>
                      <span class="font-semibold">Endereço:</span> {{ companyAddress }}
                    </div>
                    <div><span class="font-semibold">Telefone/Whatsapp:</span> {{ companyPhone }}</div>
                    <div><span class="font-semibold">E-mail:</span> {{ companyEmail }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border bg-white p-6">
            <h2 class="text-xl font-bold text-gray-900">Política de reembolso e trocas (produtos digitais)</h2>
            <p class="mt-3 text-sm text-gray-700 leading-relaxed">
              Por se tratar de produtos/entregas digitais, cada solicitação pode exigir análise específica. Nosso compromisso é tratar cada caso
              com clareza e boa-fé, respeitando as condições do produto adquirido.
            </p>

            <div class="mt-6 grid md:grid-cols-3 gap-4">
              <div class="rounded-2xl border bg-gray-50 p-5">
                <div class="text-sm font-bold text-gray-900">1) Antes do envio</div>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  Se o pedido ainda não tiver sido entregue digitalmente, podemos avaliar cancelamento e estorno, conforme método de pagamento e prazos.
                </p>
              </div>
              <div class="rounded-2xl border bg-gray-50 p-5">
                <div class="text-sm font-bold text-gray-900">2) Após o envio</div>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  Após a entrega digital, reembolso/troca depende de análise do caso (ex.: incompatibilidade comprovada, falha de entrega, suporte).
                </p>
              </div>
              <div class="rounded-2xl border bg-gray-50 p-5">
                <div class="text-sm font-bold text-gray-900">3) Para análise</div>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  Tenha número do pedido, e-mail da compra e detalhes do problema (prints, mensagens de erro e informações do sistema).
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border bg-white p-6">
            <h2 class="text-xl font-bold text-gray-900">Transparência e responsabilidade</h2>
            <p class="mt-3 text-sm text-gray-700 leading-relaxed">
              Produtos digitais podem ter regras próprias de ativação, requisitos técnicos e limitações. Por isso, é importante verificar as informações do
              produto e, em caso de dúvida, falar com o suporte antes da compra.
            </p>
          </div>

          <div class="rounded-2xl border bg-white p-6">
            <h2 class="text-xl font-bold text-gray-900">Perguntas frequentes</h2>
            <div class="mt-4 grid gap-3">
              <details class="rounded-xl border bg-gray-50 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">A entrega é imediata?</summary>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  A entrega ocorre após confirmação do pagamento. O tempo pode variar conforme o método.
                </p>
              </details>
              <details class="rounded-xl border bg-gray-50 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">Vou receber uma chave?</summary>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  Quando aplicável, você recebe chave/código e/ou instruções de ativação conforme o produto.
                </p>
              </details>
              <details class="rounded-xl border bg-gray-50 p-4">
                <summary class="cursor-pointer font-semibold text-gray-900">E se eu tiver dificuldade para ativar?</summary>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">
                  Você pode acionar o suporte para orientação.
                </p>
              </details>
            </div>
          </div>

          <div class="text-xs text-gray-500">
            Última atualização: {{ updatedAt }}.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' as any })

const { supportEmail, whatsappNumber, siteName, companyLegalName, companyCnpj, companyAddress, companyPhone, companyEmail } = useSiteBranding()
const baseUrl = useSiteUrl()

const updatedAt = new Date().toLocaleDateString('pt-BR')

const whatsappLabel = computed(() => {
  const raw = String(whatsappNumber || '').trim()
  return raw ? raw : 'Consulte no rodapé do site'
})

useSeoMeta({
  title: `Atendimento e Políticas | ${siteName}`
})

useHead(() => ({
  link: baseUrl ? [{ rel: 'canonical', href: `${baseUrl}/atendimento-e-politicas` }] : []
}))
</script>
