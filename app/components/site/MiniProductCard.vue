<template>
  <NuxtLink
    :to="productPath"
    class="group relative flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
  >
    <!-- Imagem do produto -->
    <div class="relative h-28 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <img
        :src="productImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        referrerpolicy="no-referrer"
        @error="onImageError"
      />
      <!-- Selos -->
      <div class="absolute top-2 right-2 flex flex-col gap-1">
        <span class="inline-flex items-center rounded-full bg-blue-600/90 px-2 py-0.5 text-[9px] font-bold text-white tracking-wider">
          Original
        </span>
        <span class="inline-flex items-center rounded-full bg-green-600/90 px-2 py-0.5 text-[9px] font-bold text-white tracking-wider">
          Entrega imediata
        </span>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 p-4">
      <h3 class="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.4rem]">
        {{ productName }}
      </h3>
      <p class="mt-2 text-xs text-gray-700 line-clamp-2 min-h-[2.4rem]">
        {{ benefitText }}
      </p>
      <div class="mt-auto pt-3">
        <button
          type="button"
          class="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 transition-colors"
        >
          Comprar
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  product: {
    id: string
    nome: string
    slug: string
    imagem?: string | null
    descricao?: string | null
    preco?: number | null
  }
}

const props = defineProps<Props>()

const intl = useIntlContext()
const productsIndexPath = computed(() => (intl.language.value === 'en' ? '/products' : '/produtos'))

const productPath = computed(() => `${productsIndexPath.value}/${props.product.slug}`)

const productName = computed(() => props.product.nome || 'Produto')

const productImage = computed(() => {
  if (props.product.imagem) return props.product.imagem
  // Fallback por nome do produto
  const name = props.product.nome.toLowerCase()
  if (name.includes('office')) return '/images/office-fallback.png'
  if (name.includes('windows')) return '/images/windows-fallback.png'
  if (name.includes('autodesk') || name.includes('autocad')) return '/images/autodesk-fallback.png'
  if (name.includes('project')) return '/images/project-fallback.png'
  if (name.includes('visio')) return '/images/visio-fallback.png'
  if (name.includes('server')) return '/images/server-fallback.png'
  return '/images/software-fallback.png'
})

const benefitText = computed(() => {
  if (props.product.descricao) {
    return props.product.descricao.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
  }
  const name = props.product.nome.toLowerCase()
  if (name.includes('office')) return 'Licença digital original para PC e Mac. Ativação online imediata.'
  if (name.includes('windows')) return 'Licença digital original. Ativação online em minutos.'
  if (name.includes('autodesk') || name.includes('autocad')) return 'Assinatura anual. Licença oficial com suporte completo.'
  if (name.includes('project')) return 'Licença digital original. Gerencie projetos com facilidade.'
  if (name.includes('visio')) return 'Licença digital original. Crie diagramas profissionais.'
  if (name.includes('server')) return 'Licença digital original. Servidor completo para empresas.'
  return 'Licença digital original. Entrega imediata por e-mail.'
})

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  const name = props.product.nome.toLowerCase()
  if (name.includes('office')) img.src = '/images/office-fallback.png'
  else if (name.includes('windows')) img.src = '/images/windows-fallback.png'
  else if (name.includes('autodesk') || name.includes('autocad')) img.src = '/images/autodesk-fallback.png'
  else img.src = '/images/software-fallback.png'
}
</script>
