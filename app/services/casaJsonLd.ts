type CasaLang = 'pt-BR' | 'en' | 'es' | 'fr' | 'de'

function normalizeHost(host: string) {
  const h0 = String(host || '').trim().toLowerCase()
  const h1 = h0.replace(/^https?:\/\//, '')
  const h2 = h1.replace(/\/.*/, '')
  const h3 = h2.replace(/:\d+$/, '')
  const h4 = h3.replace(/^www\./, '')
  return h4.replace(/\.$/, '')
}

function getLangFromHost(host: string): CasaLang {
  const h = normalizeHost(host)
  if (h.startsWith('en.')) return 'en'
  if (h.startsWith('es.')) return 'es'
  if (h.startsWith('fr.')) return 'fr'
  if (h.startsWith('de.')) return 'de'
  return 'pt-BR'
}

function getBaseUrl(lang: CasaLang) {
  if (lang === 'en') return 'https://en.casadosoftware.com.br'
  if (lang === 'es') return 'https://es.casadosoftware.com.br'
  if (lang === 'fr') return 'https://fr.casadosoftware.com.br'
  if (lang === 'de') return 'https://de.casadosoftware.com.br'
  return 'https://casadosoftware.com.br'
}

function getSearchPath(lang: CasaLang) {
  if (lang === 'en') return '/products'
  if (lang === 'es') return '/productos'
  if (lang === 'fr') return '/produits'
  if (lang === 'de') return '/produkte'
  return '/produtos'
}

function getOrgDescription(lang: CasaLang) {
  if (lang === 'en') return 'Genuine software licenses with automated delivery and specialist support.'
  if (lang === 'es') return 'Licencias digitales legítimas con entrega automática y soporte especializado.'
  if (lang === 'fr') return 'Licences numériques légitimes avec livraison automatique et support spécialisé.'
  if (lang === 'de') return 'Legitime digitale Softwarelizenzen mit automatischer Zustellung und spezialisiertem Support.'
  return 'Loja digital de licenças originais de software com entrega automática e suporte especializado.'
}

function getFaq(lang: CasaLang) {
  const pt = [
    {
      q: 'As licenças vendidas são originais e legais?',
      a: 'Sim. Trabalhamos com licenças digitais legítimas e comunicação transparente do produto.'
    },
    {
      q: 'Como recebo a licença após o pagamento?',
      a: 'Após a confirmação, você recebe automaticamente por e-mail as informações e orientações.'
    },
    {
      q: 'Em quanto tempo a entrega acontece?',
      a: 'Na maioria dos casos, poucos minutos após a confirmação do pagamento (pode variar conforme o método).'
    },
    {
      q: 'Posso reinstalar o software no futuro?',
      a: 'Depende do tipo de licença e do produto. Em geral, orientamos o procedimento correto conforme o caso.'
    },
    {
      q: 'Vocês oferecem suporte para instalação e ativação?',
      a: 'Sim. Nosso suporte auxilia com orientações e dúvidas comuns no processo.'
    },
    {
      q: 'E se eu tiver problemas com a compra?',
      a: 'Temos canais de atendimento e políticas claras para resolver ocorrências com transparência.'
    }
  ]

  const en = [
    {
      q: 'Are the licenses genuine and legitimate?',
      a: 'Yes. We provide genuine digital licenses with transparent product information and a secure checkout experience.'
    },
    {
      q: 'How do I receive my license after payment?',
      a: 'After payment confirmation, delivery is automated by email with the relevant information and guidance.'
    },
    {
      q: 'How fast is delivery?',
      a: 'Typically within minutes after confirmation, depending on the payment method.'
    },
    {
      q: 'Do you provide installation and activation guidance?',
      a: 'Yes. Our support team assists with common installation and activation questions according to the product purchased.'
    },
    {
      q: 'Can I reinstall the software later?',
      a: 'It depends on the license type and product. We provide guidance based on what you purchased.'
    },
    {
      q: 'What if I need help after purchase?',
      a: 'We provide support channels and clear policies to help resolve issues transparently.'
    }
  ]

  const es = [
    {
      q: '¿Las licencias que venden son originales y legales?',
      a: 'Sí. Ofrecemos licencias digitales legítimas y describimos cada producto de forma clara y transparente.'
    },
    {
      q: '¿Cómo recibo mi licencia después del pago?',
      a: 'Tras la confirmación del pago, la entrega se realiza automáticamente por correo electrónico con las indicaciones correspondientes.'
    },
    {
      q: '¿Cuánto tarda la entrega?',
      a: 'Normalmente en pocos minutos después de la confirmación. El tiempo puede variar según el método de pago.'
    },
    {
      q: '¿Incluyen soporte para instalación y activación?',
      a: 'Sí. Nuestro equipo de soporte ayuda con dudas comunes de instalación y activación, según el producto adquirido.'
    },
    {
      q: '¿Puedo reinstalar el software más adelante?',
      a: 'Depende del tipo de licencia y del producto. Te orientamos sobre el procedimiento correcto según tu compra.'
    },
    {
      q: '¿Qué pasa si tengo un problema después de comprar?',
      a: 'Disponemos de canales de atención y políticas claras para ayudarte a resolver cualquier incidencia.'
    }
  ]

  const fr = [
    {
      q: 'Les licences vendues sont-elles officielles et légitimes ?',
      a: 'Oui. Nous proposons des licences numériques légitimes et une présentation transparente des produits.'
    },
    {
      q: 'Comment vais-je recevoir ma licence après le paiement ?',
      a: 'Après confirmation du paiement, la livraison est automatique par e-mail avec les indications nécessaires.'
    },
    {
      q: 'Quel est le délai de livraison ?',
      a: 'Généralement quelques minutes après confirmation. Le délai peut varier selon le moyen de paiement.'
    },
    {
      q: 'Proposez-vous une assistance pour l’installation et l’activation ?',
      a: 'Oui. Notre support aide sur les questions courantes d’installation et d’activation, selon le produit acheté.'
    },
    {
      q: 'Puis-je réinstaller le logiciel plus tard ?',
      a: 'Cela dépend du type de licence et du produit. Nous indiquons la procédure appropriée selon votre achat.'
    },
    {
      q: 'Que faire en cas de problème après l’achat ?',
      a: 'Nous disposons de canaux d’assistance et de politiques claires pour résoudre les incidents avec transparence.'
    }
  ]

  const de = [
    {
      q: 'Sind die angebotenen Lizenzen original und rechtmäßig?',
      a: 'Ja. Wir bieten legitime digitale Lizenzen und eine transparente Produktbeschreibung.'
    },
    {
      q: 'Wie erhalte ich meine Lizenz nach der Zahlung?',
      a: 'Nach Zahlungsbestätigung erfolgt die Zustellung automatisch per E‑Mail inklusive Hinweise und Informationen.'
    },
    {
      q: 'Wie schnell erfolgt die Lieferung?',
      a: 'In der Regel innerhalb weniger Minuten nach Bestätigung. Die Dauer kann je nach Zahlungsmethode variieren.'
    },
    {
      q: 'Gibt es Support für Installation und Aktivierung?',
      a: 'Ja. Unser Support hilft bei typischen Fragen zur Installation und Aktivierung – passend zum gekauften Produkt.'
    },
    {
      q: 'Kann ich die Software später neu installieren?',
      a: 'Das hängt vom Lizenztyp und vom Produkt ab. Wir geben Hinweise zum richtigen Vorgehen je nach Kauf.'
    },
    {
      q: 'Was ist, wenn nach dem Kauf ein Problem auftritt?',
      a: 'Wir bieten Support-Kanäle und klare Richtlinien, um Anliegen transparent zu lösen.'
    }
  ]

  if (lang === 'en') return en
  if (lang === 'es') return es
  if (lang === 'fr') return fr
  if (lang === 'de') return de
  return pt
}

export function getCasaHomeJsonLdBundle(params?: { host?: string; origin?: string }) {
  const host = String(params?.host || '')
  const originParam = params?.origin ? String(params.origin) : ''

  const baseUrl = String(originParam || '').trim().replace(/\/+$/, '') || getBaseUrl(getLangFromHost(host))
  const hostname = normalizeHost(host || baseUrl)

  const lang: CasaLang =
    hostname.startsWith('en.') ? 'en' :
      hostname.startsWith('es.') ? 'es' :
        hostname.startsWith('fr.') ? 'fr' :
          hostname.startsWith('de.') ? 'de' :
            'pt-BR'

  const productsPath =
    lang === 'en' ? '/products' :
      lang === 'es' ? '/productos' :
        lang === 'fr' ? '/produits' :
          lang === 'de' ? '/produkte' :
            '/produtos'

  const logo = `${baseUrl}/logo-casa-do-software.png`

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Casa do Software',
    url: baseUrl,
    logo,
    sameAs: [],
    description: getOrgDescription(lang)
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Casa do Software',
    url: baseUrl,
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}${productsPath}?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: getFaq(lang).map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: x.a
      }
    }))
  }

  return [org, website, faq]
}
