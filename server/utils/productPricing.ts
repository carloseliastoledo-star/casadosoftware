import { getStoreContext } from './store'

export type StorePriceOverride = {
  preco: number
  precoAntigo: number | null
}

export function applyStorePrice<T extends Record<string, any>>(
  product: T,
  override: StorePriceOverride | null | undefined
): T {
  if (!override) return product

  return {
    ...product,
    preco: override.preco,
    precoAntigo: override.precoAntigo
  }
}

export async function getProdutoEffectivePrice(tx: any, produtoId: string): Promise<StorePriceOverride> {
  const { storeSlug } = getStoreContext()
  const produto = await tx.produto.findUnique({
    where: { id: produtoId },
    select: { preco: true, precoAntigo: true }
  })

  if (!produto) {
    throw new Error('Produto não encontrado')
  }

  if (!storeSlug) {
    return {
      preco: Number(produto.preco),
      precoAntigo: produto.precoAntigo == null ? null : Number(produto.precoAntigo)
    }
  }

  const override = await tx.produtoPrecoLoja.findUnique({
    where: { produtoId_storeSlug: { produtoId, storeSlug } },
    select: { preco: true, precoAntigo: true }
  })

  return {
    preco: Number(override?.preco ?? produto.preco),
    precoAntigo: override?.precoAntigo == null ? (produto.precoAntigo == null ? null : Number(produto.precoAntigo)) : Number(override.precoAntigo)
  }
}
