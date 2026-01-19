export interface Product {
  id: number
  name: string
  slug: string
  price: number
  shortDescription: string
  description: string
  image: string
}

const rawProducts = [
  {
    id: 1,
    name: 'Windows 11 Pro',
    slug: 'windows-11-pro',
    price: 59.9,
    shortDescription: 'Licença original e vitalícia para 1 PC',
    description:
      'Windows 11 Pro com licença original e vitalícia. Compatível com Windows 10 e 11.',
  },
  {
    id: 2,
    name: 'Windows 10 Pro',
    slug: 'windows-10-pro',
    price: 49.9,
    shortDescription: 'Licença original do Windows 10 Pro',
    description:
      'Windows 10 Pro original, ativação segura e entrega imediata.',
  },
  {
    id: 3,
    name: 'Office 2021 Pro Plus',
    slug: 'office-2021-pro',
    price: 89.9,
    shortDescription: 'Pacote Office completo sem mensalidade',
    description:
      'Office 2021 Pro Plus com Word, Excel, PowerPoint e muito mais.',
  },
  {
    id: 4,
    name: 'Office 365',
    slug: 'office-365',
    price: 119.9,
    shortDescription: 'Office por assinatura anual',
    description:
      'Office 365 com aplicativos sempre atualizados por 12 meses.',
  },
]

export const products: Product[] = rawProducts.map(p => ({
  ...p,
  image: `/images/produto/${p.slug}.jpg`,
}))
