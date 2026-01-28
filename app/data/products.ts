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
    shortDescription: 'Licença digital permanente para 1 PC',
    description:
      'Windows 11 Pro com licença digital permanente. Compatível com Windows 10 e 11.',
  },
  {
    id: 2,
    name: 'Windows 10 Pro',
    slug: 'windows-10-pro',
    price: 49.9,
    shortDescription: 'Licença digital do Windows 10 Pro',
    description:
      'Windows 10 Pro, ativação segura e envio imediato após confirmação.',
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
    shortDescription: 'Assinatura anual (12 meses) por conta fornecida',
    description:
      'Assinatura anual do Office 365 (12 meses). Entrega por conta fornecida (login e senha) com envio imediato após confirmação.',
  },
]

export const products: Product[] = rawProducts.map(p => ({
  ...p,
  image: `/images/produto/${p.slug}.jpg`,
}))
