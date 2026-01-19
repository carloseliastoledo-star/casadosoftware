<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tutorials = {
  'windows-11-pro': {
    title: 'Como Ativar Windows 10/11 Pro por Telefone',
    content: `
Você receberá 1 chave de ativação do Windows 10/11 Pro.

Passo a passo resumido:
1. Pressione Windows + R
2. Digite slui.exe 4
3. Selecione seu país
4. Ligue para o número exibido ou use getcid.us
5. Insira o ID de confirmação
6. Windows ativado com sucesso
    `,
  },

  'office-2021-pro': {
    title: 'Como Ativar Office 2021 Pro Plus por Telefone',
    content: `
Você receberá 1 chave do Office 2021 Pro Plus.

Passo a passo resumido:
1. Abra o Word ou Excel
2. Vá em Arquivo > Conta
3. Clique em Ativar Produto
4. Escolha ativação por telefone
5. Use getcid.us ou ligação
6. Office ativado com sucesso
    `,
  },
}

const tutorial = tutorials[route.params.slug]
</script>

<template>
  <section class="py-20">
    <div class="max-w-4xl mx-auto px-6">

      <div v-if="!tutorial">
        <h1 class="text-2xl font-bold">
          Tutorial não encontrado
        </h1>
      </div>

      <div v-else>
        <h1 class="text-3xl font-bold mb-6">
          {{ tutorial.title }}
        </h1>

        <pre class="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-sm">
{{ tutorial.content }}
        </pre>
      </div>

    </div>
  </section>
</template>
