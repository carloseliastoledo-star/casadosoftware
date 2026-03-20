# Softwares Mundi

International, English-only e-commerce storefront for digital software licenses.

## Setup

1. Copy env:

```bash
cp .env.example .env
```

2. Install:

```bash
npm install
```

3. Run dev:

```bash
npm run dev
```

## Stripe

This project uses Stripe Checkout.

- Set `STRIPE_SECRET_KEY`
- Set `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL`

The server endpoint is `POST /api/checkout`.

## Admin: product image upload

Open:

- `/admin/products/<slug>`

Example:

- `/admin/products/microsoft-office-365-lifetime`

Uploads are stored locally at:

- `public/uploads/products/`

The image URL is persisted to:

- `server/storage/product-overrides.json`

### Optional protection

Set `ADMIN_TOKEN` in your `.env`.

When set, calls to `/api/admin/*` require:

- `Authorization: Bearer <ADMIN_TOKEN>`
