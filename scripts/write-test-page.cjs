const fs = require('fs')
const content = [
  '<script setup lang="ts">',
  'const route = useRoute()',
  '',
  'console.log("[TESTE-PRODUTO-SSR] rota carregou:", route.params.slug)',
  '',
  'useHead({',
  '  title: "Teste Produto SSR"',
  '})',
  '<\/script>',
  '',
  '<template>',
  '  <main style="padding:40px">',
  '    <h1>Produto SSR funcionando</h1>',
  '    <p>Slug: {{ route.params.slug }}</p>',
  '  </main>',
  '</template>',
  ''
].join('\n')

fs.writeFileSync('app/pages/produto/[slug].vue', content, 'utf8')
console.log('Done - wrote minimal test page')
