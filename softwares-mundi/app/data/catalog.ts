export type Category = {
  slug: string
  name: string
  description: string
}

export type ProductFaq = { q: string; a: string }

export type ProductImageVariant = 'office' | 'windows' | 'adobe' | 'security' | 'utility' | 'generic'

export type Product = {
  slug: string
  title: string
  shortDescription: string
  description: {
    whatIs: string
    delivery: string
    activation: string
    requirements: string
  }
  categorySlug: string
  priceUsdCents: number
  compareAtUsdCents?: number
  imageUrl?: string
  stockLeft?: number
  rating?: number
  reviewCount?: number
  imageVariant?: ProductImageVariant
  benefits: string[]
  faqs: ProductFaq[]
  relatedSlugs: string[]
}

export const categories: Category[] = [
  {
    slug: 'microsoft',
    name: 'Microsoft',
    description: 'Windows and Office licenses built for productivity and reliability.'
  },
  {
    slug: 'adobe',
    name: 'Adobe',
    description: 'Creative tools for design, video editing, and content production.'
  },
  {
    slug: 'antivirus-security',
    name: 'Antivirus & Security',
    description: 'Protection for your devices and privacy.'
  },
  {
    slug: 'utilities',
    name: 'Utilities',
    description: 'Everyday tools to keep your PC fast, clean, and optimized.'
  },
  {
    slug: 'other-software',
    name: 'Other Software',
    description: 'More genuine software options for your workflow.'
  }
]

export const products: Product[] = [
  {
    slug: 'microsoft-office-365-lifetime',
    title: 'Microsoft Office 365 Lifetime License',
    shortDescription: 'Get premium Office apps with lifetime activation and instant delivery.',
    description: {
      whatIs:
        'A genuine software license that enables Office productivity apps. Ideal for work, study, and home use.',
      delivery:
        'After payment confirmation, your license and instructions are sent instantly to your email.',
      activation:
        'Open the activation page or app, sign in, and enter your key. Detailed steps are provided after purchase.',
      requirements:
        'Windows 10/11 or macOS. Stable internet connection for activation. Compatible with most modern PCs.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 2999,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'office',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [
      { q: 'How fast is delivery?', a: 'Most orders are delivered instantly by email after payment confirmation.' },
      { q: 'Is this a genuine license?', a: 'Yes. We only advertise genuine software licenses.' },
      { q: 'Can I use it worldwide?', a: 'Yes. Licenses are designed to work internationally unless stated otherwise.' }
    ],
    relatedSlugs: ['microsoft-office-2024-professional-plus', 'windows-11-pro-key', 'microsoft-visio-2021']
  },
  {
    slug: 'microsoft-office-2024-professional-plus',
    title: 'Microsoft Office 2024 Professional Plus',
    shortDescription: 'Professional-grade Office suite with lifetime activation.',
    description: {
      whatIs: 'A complete Office suite for demanding users who need reliability and performance.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Step-by-step activation guide provided after purchase.',
      requirements: 'Windows 10/11. Internet required for activation.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 3499,
    compareAtUsdCents: 8999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'office',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [
      { q: 'Does it include Word, Excel and PowerPoint?', a: 'Yes, it includes the classic Office apps.' },
      { q: 'Is delivery instant?', a: 'Yes, delivery is made by email after payment confirmation.' }
    ],
    relatedSlugs: ['microsoft-office-2021-professional-plus', 'microsoft-project-2021', 'microsoft-visio-2021']
  },
  {
    slug: 'microsoft-office-2021-professional-plus',
    title: 'Microsoft Office 2021 Professional Plus',
    shortDescription: 'A proven Office suite with lifetime activation and fast delivery.',
    description: {
      whatIs: 'Office 2021 suite for productivity and business workflows.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Activation steps included after purchase.',
      requirements: 'Windows 10/11. Internet required for activation.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 2699,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'office',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Is it compatible with Windows 11?', a: 'Yes, it works with Windows 11.' }],
    relatedSlugs: ['microsoft-office-2024-professional-plus', 'windows-10-pro-key', 'microsoft-project-2021']
  },
  {
    slug: 'windows-11-pro-key',
    title: 'Windows 11 Pro Key',
    shortDescription: 'Upgrade to Windows 11 Pro with lifetime activation and instant delivery.',
    description: {
      whatIs: 'A genuine Windows 11 Pro license key for professional features and security.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Enter your key in Settings → System → Activation. Instructions provided after purchase.',
      requirements: 'Compatible PC meeting Windows 11 requirements.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 1999,
    compareAtUsdCents: 6999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'windows',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Can I upgrade from Windows 10?', a: 'Yes, in most cases you can upgrade and activate with a valid key.' }],
    relatedSlugs: ['windows-10-pro-key', 'microsoft-office-2024-professional-plus', 'microsoft-project-2021']
  },
  {
    slug: 'windows-10-pro-key',
    title: 'Windows 10 Pro Key',
    shortDescription: 'Reliable Windows 10 Pro activation with instant email delivery.',
    description: {
      whatIs: 'A genuine Windows 10 Pro license key for activation.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Enter your key in Settings → Update & Security → Activation.',
      requirements: 'Windows 10 installed on a compatible PC.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 1799,
    compareAtUsdCents: 5999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'windows',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Will I receive instructions?', a: 'Yes, your email includes activation steps.' }],
    relatedSlugs: ['windows-11-pro-key', 'microsoft-office-2021-professional-plus', 'microsoft-visio-2021']
  },
  {
    slug: 'microsoft-visio-2021',
    title: 'Microsoft Visio 2021',
    shortDescription: 'Create diagrams and flows with a genuine Visio license.',
    description: {
      whatIs: 'Visio helps you build professional diagrams and visual workflows.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation guide included after purchase.',
      requirements: 'Windows 10/11. Internet required for activation.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 2199,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'office',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Is Visio separate from Office?', a: 'Yes, Visio is a separate product.' }],
    relatedSlugs: ['microsoft-project-2021', 'microsoft-office-2024-professional-plus', 'windows-11-pro-key']
  },
  {
    slug: 'microsoft-project-2021',
    title: 'Microsoft Project 2021',
    shortDescription: 'Plan projects efficiently with a genuine Project license.',
    description: {
      whatIs: 'Project provides tools for planning, managing, and tracking tasks.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Instructions included after purchase.',
      requirements: 'Windows 10/11. Internet required for activation.'
    },
    categorySlug: 'microsoft',
    priceUsdCents: 2299,
    compareAtUsdCents: 8499,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'office',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Does it work on Mac?', a: 'This product is intended for Windows environments.' }],
    relatedSlugs: ['microsoft-visio-2021', 'microsoft-office-2021-professional-plus', 'windows-10-pro-key']
  },

  {
    slug: 'adobe-photoshop-2024',
    title: 'Adobe Photoshop 2024',
    shortDescription: 'Professional image editing with genuine licensing and instant delivery.',
    description: {
      whatIs: 'Industry-standard image editing software for creators and professionals.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation instructions provided after purchase.',
      requirements: 'Windows or macOS. Internet required for activation.'
    },
    categorySlug: 'adobe',
    priceUsdCents: 3999,
    compareAtUsdCents: 9999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'adobe',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Is it suitable for professionals?', a: 'Yes, Photoshop is widely used in professional workflows.' }],
    relatedSlugs: ['adobe-premiere-pro-2024', 'adobe-after-effects-2024', 'adobe-creative-cloud']
  },
  {
    slug: 'adobe-premiere-pro-2024',
    title: 'Adobe Premiere Pro 2024',
    shortDescription: 'Edit videos smoothly with genuine licensing and instant delivery.',
    description: {
      whatIs: 'Video editing software for content creators and professionals.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Activation guide included after purchase.',
      requirements: 'Windows or macOS. Internet required for activation.'
    },
    categorySlug: 'adobe',
    priceUsdCents: 4299,
    compareAtUsdCents: 10999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'adobe',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Do I get instructions?', a: 'Yes, your email includes setup and activation steps.' }],
    relatedSlugs: ['adobe-after-effects-2024', 'adobe-photoshop-2024', 'adobe-creative-cloud']
  },
  {
    slug: 'adobe-after-effects-2024',
    title: 'Adobe After Effects 2024',
    shortDescription: 'Motion graphics and visual effects with genuine licensing.',
    description: {
      whatIs: 'Create high-quality motion graphics and effects.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation steps included after purchase.',
      requirements: 'Windows or macOS. Internet required for activation.'
    },
    categorySlug: 'adobe',
    priceUsdCents: 4299,
    compareAtUsdCents: 10999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'adobe',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Is delivery immediate?', a: 'Delivery is made by email after payment confirmation.' }],
    relatedSlugs: ['adobe-premiere-pro-2024', 'adobe-photoshop-2024', 'adobe-creative-cloud']
  },
  {
    slug: 'adobe-creative-cloud',
    title: 'Adobe Creative Cloud',
    shortDescription: 'Access leading creative tools with genuine licensing and instant delivery.',
    description: {
      whatIs: 'A bundle of creative apps for design, photo, and video.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Instructions included after purchase.',
      requirements: 'Windows or macOS. Internet required for activation.'
    },
    categorySlug: 'adobe',
    priceUsdCents: 4999,
    compareAtUsdCents: 12999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'adobe',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Does it include multiple apps?', a: 'Yes, Creative Cloud is designed to include a suite of apps.' }],
    relatedSlugs: ['adobe-photoshop-2024', 'adobe-premiere-pro-2024', 'adobe-after-effects-2024']
  },

  {
    slug: 'kaspersky-total-security',
    title: 'Kaspersky Total Security',
    shortDescription: 'Comprehensive security suite with genuine licensing and fast delivery.',
    description: {
      whatIs: 'All-in-one security solution for your devices.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation guide included after purchase.',
      requirements: 'Windows, macOS, Android, or iOS. Internet required for activation.'
    },
    categorySlug: 'antivirus-security',
    priceUsdCents: 2999,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'security',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Secure Setup'],
    faqs: [{ q: 'Is it good for multiple devices?', a: 'Many plans support multiple devices depending on your selection.' }],
    relatedSlugs: ['bitdefender-total-security', 'norton-360-deluxe', 'mcafee-total-protection']
  },
  {
    slug: 'norton-360-deluxe',
    title: 'Norton 360 Deluxe',
    shortDescription: 'Trusted protection with fast delivery and secure payment.',
    description: {
      whatIs: 'Security and privacy suite for everyday protection.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Instructions included after purchase.',
      requirements: 'Windows, macOS, Android, or iOS. Internet required for activation.'
    },
    categorySlug: 'antivirus-security',
    priceUsdCents: 2999,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'security',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Secure Setup'],
    faqs: [{ q: 'Is delivery instant?', a: 'Delivery is made by email after payment confirmation.' }],
    relatedSlugs: ['kaspersky-total-security', 'bitdefender-total-security', 'mcafee-total-protection']
  },
  {
    slug: 'mcafee-total-protection',
    title: 'McAfee Total Protection',
    shortDescription: 'Protection for your devices with genuine licensing and instant delivery.',
    description: {
      whatIs: 'Security suite for devices and privacy.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation steps provided after purchase.',
      requirements: 'Windows, macOS, Android, or iOS. Internet required for activation.'
    },
    categorySlug: 'antivirus-security',
    priceUsdCents: 2799,
    compareAtUsdCents: 6999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'security',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Secure Setup'],
    faqs: [{ q: 'Do you provide instructions?', a: 'Yes, you receive a detailed email with setup steps.' }],
    relatedSlugs: ['kaspersky-total-security', 'norton-360-deluxe', 'bitdefender-total-security']
  },
  {
    slug: 'bitdefender-total-security',
    title: 'Bitdefender Total Security',
    shortDescription: 'High-performance protection with genuine licensing and fast delivery.',
    description: {
      whatIs: 'Security suite with advanced protection features.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Instructions included after purchase.',
      requirements: 'Windows, macOS, Android, or iOS. Internet required for activation.'
    },
    categorySlug: 'antivirus-security',
    priceUsdCents: 3199,
    compareAtUsdCents: 7999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'security',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Secure Setup'],
    faqs: [{ q: 'Does it work worldwide?', a: 'Yes, it is built for international usage.' }],
    relatedSlugs: ['kaspersky-total-security', 'norton-360-deluxe', 'mcafee-total-protection']
  },

  {
    slug: 'winrar-license',
    title: 'WinRAR License',
    shortDescription: 'A simple, genuine WinRAR license with instant delivery.',
    description: {
      whatIs: 'License for WinRAR compression utility.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Activation instructions provided after purchase.',
      requirements: 'Windows PC. Internet required for activation.'
    },
    categorySlug: 'utilities',
    priceUsdCents: 1299,
    compareAtUsdCents: 2999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'utility',
    benefits: ['Instant Email Delivery', 'Lifetime Activation', 'Works Worldwide', 'Genuine License'],
    faqs: [{ q: 'Is it lifetime?', a: 'This listing is presented as a lifetime activation license.' }],
    relatedSlugs: ['ccleaner-professional', 'driver-booster-pro', 'windows-11-pro-key']
  },
  {
    slug: 'ccleaner-professional',
    title: 'CCleaner Professional',
    shortDescription: 'Keep your PC optimized with a genuine license and instant delivery.',
    description: {
      whatIs: 'Utility to help maintain performance and clean temporary files.',
      delivery: 'Instant email delivery after secure checkout.',
      activation: 'Setup and activation steps included after purchase.',
      requirements: 'Windows PC. Internet required for activation.'
    },
    categorySlug: 'utilities',
    priceUsdCents: 1499,
    compareAtUsdCents: 3999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'utility',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Easy Setup'],
    faqs: [{ q: 'Is it safe?', a: 'We promote genuine software intended for safe usage.' }],
    relatedSlugs: ['driver-booster-pro', 'winrar-license', 'windows-10-pro-key']
  },
  {
    slug: 'driver-booster-pro',
    title: 'Driver Booster Pro',
    shortDescription: 'Update drivers easily with a genuine license and instant delivery.',
    description: {
      whatIs: 'Utility to help keep device drivers up to date.',
      delivery: 'Instant email delivery after payment confirmation.',
      activation: 'Instructions included after purchase.',
      requirements: 'Windows PC. Internet required for activation.'
    },
    categorySlug: 'utilities',
    priceUsdCents: 1499,
    compareAtUsdCents: 3999,
    stockLeft: 12,
    rating: 4.8,
    reviewCount: 12483,
    imageVariant: 'utility',
    benefits: ['Instant Email Delivery', 'Works Worldwide', 'Genuine License', 'Easy Setup'],
    faqs: [{ q: 'How do I activate?', a: 'You receive an activation guide after checkout.' }],
    relatedSlugs: ['ccleaner-professional', 'winrar-license', 'kaspersky-total-security']
  }
]

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug) || null
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) || null
}

export function getProductsByCategorySlug(slug: string) {
  return products.filter((p) => p.categorySlug === slug)
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}
