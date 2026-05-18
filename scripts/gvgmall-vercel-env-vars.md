# Variáveis de Ambiente — Projeto Vercel gvgmall.co

Configure estas variáveis no projeto Vercel da gvgmall.co.
**Nunca use o DATABASE_URL da Casa do Software aqui.**

## Obrigatórias

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `mysql://...` (novo banco Railway exclusivo da gvgmall) |
| `STORE_SLUG` | `international` |
| `SITE_URL` | `https://www.gvgmall.co` |
| `NITRO_PRESET` | `vercel` |

## Identidade da loja

| Variável | Valor sugerido |
|---|---|
| `SITE_NAME` | `GVG Mall` |
| `SUPPORT_EMAIL` | `support@gvgmall.co` |
| `SITE_LOGO_PATH` | `/logo-gvgmall.png` |
| `SITE_THEME_COLOR` | `#1a1a2e` |
| `SITE_TOPBAR_TEXT` | `` |
| `SITE_TOPBAR_LINK` | `` |
| `COMPANY_LEGAL_NAME` | `` |
| `COMPANY_CNPJ` | `` |
| `COMPANY_ADDRESS` | `` |
| `COMPANY_PHONE` | `` |
| `COMPANY_EMAIL` | `support@gvgmall.co` |
| `WHATSAPP_NUMBER` | `` |

## Pagamentos (configure os da gvgmall)

| Variável | Valor |
|---|---|
| `MERCADOPAGO_PUBLIC_KEY` | (chave pública MP da gvgmall, se usar) |
| `STRIPE_PUBLISHABLE_KEY` | (chave pública Stripe da gvgmall) |
| `STRIPE_SECRET_KEY` | (chave secreta Stripe da gvgmall) |

## Internacional

| Variável | Valor |
|---|---|
| `INTL_SUBDOMAIN_MODE` | `0` |
| `EN_DOMAIN_URL` | `https://www.gvgmall.co` |
| `PT_DOMAIN_URL` | `https://casadosoftware.com.br` |

## Sessão / Auth

| Variável | Valor |
|---|---|
| `SESSION_SECRET` | (string aleatória, diferente da casadosoftware) |
| `ADMIN_SESSION_SECRET` | (string aleatória, diferente da casadosoftware) |

## Como aplicar

1. Acesse Vercel → projeto gvgmall → Settings → Environment Variables
2. Adicione cada variável acima com Environment = Production
3. Após salvar todas, faça Redeploy (sem cache)
