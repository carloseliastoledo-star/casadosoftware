export type PriceRow = {
  currency: string
  amount: number | null
  oldAmount?: number | null
}

export type EffectivePriceResult = {
  currency: 'brl' | 'usd' | 'eur'
  amount: number | null
  oldAmount: number | null
  unavailable: boolean
}

function normalizeCurrency(input: unknown): 'brl' | 'usd' | 'eur' {
  const c = String(input || '').trim().toLowerCase()
  if (c === 'usd') return 'usd'
  if (c === 'eur') return 'eur'
  return 'brl'
}

export function resolveEffectivePrice(params: {
  requestedCurrency: 'brl' | 'usd' | 'eur'
  baseAmount: number
  baseOldAmount: number | null
  storeAmountOverride?: number | null
  storeOldAmountOverride?: number | null
  currencyRows?: PriceRow[]
}): EffectivePriceResult {
  const requestedCurrency = normalizeCurrency(params.requestedCurrency)

  const baseAmount = Number(params.baseAmount || 0)
  const baseOldAmount = params.baseOldAmount == null ? null : Number(params.baseOldAmount)

  const storeAmount = params.storeAmountOverride == null ? null : Number(params.storeAmountOverride)
  const storeOldAmount = params.storeOldAmountOverride == null ? null : Number(params.storeOldAmountOverride)

  const brlAmount = storeAmount == null ? baseAmount : storeAmount
  const brlOld = storeOldAmount == null ? baseOldAmount : storeOldAmount

  if (requestedCurrency === 'brl') {
    return {
      currency: 'brl',
      amount: Number.isFinite(brlAmount) && brlAmount > 0 ? brlAmount : null,
      oldAmount: brlOld != null && Number.isFinite(brlOld) && brlOld > 0 ? brlOld : null,
      unavailable: !(Number.isFinite(brlAmount) && brlAmount > 0)
    }
  }

  const rows = Array.isArray(params.currencyRows) ? params.currencyRows : []
  const byCurrency = new Map(
    rows
      .map((r) => ({
        currency: String(r.currency || '').trim().toLowerCase(),
        amount: r.amount == null ? null : Number(r.amount),
        oldAmount: (r as any).oldAmount == null ? null : Number((r as any).oldAmount)
      }))
      .filter((r) => r.currency)
      .map((r) => [r.currency, r])
  )

  const requested = byCurrency.get(requestedCurrency)
  const usd = byCurrency.get('usd')

  const selected = requestedCurrency === 'eur'
    ? (requested && requested.amount && requested.amount > 0 ? requested : usd)
    : requested

  const amount = selected?.amount == null ? null : Number(selected.amount)
  const oldAmount = selected?.oldAmount == null ? null : Number(selected.oldAmount)

  if (Number.isFinite(amount) && amount! > 0) {
    return {
      currency: (requestedCurrency === 'eur' && (!requested || !(requested.amount && requested.amount > 0))) ? 'usd' : requestedCurrency,
      amount,
      oldAmount: oldAmount != null && Number.isFinite(oldAmount) && oldAmount > 0 ? oldAmount : null,
      unavailable: false
    }
  }

  return {
    currency: requestedCurrency,
    amount: null,
    oldAmount: null,
    unavailable: true
  }
}
