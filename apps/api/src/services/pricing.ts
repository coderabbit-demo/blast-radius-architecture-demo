import { addCents, applyRate, convertFromUsd, type Cents, type CurrencyCode } from "@ledgerly/money"
import type { LineItem } from "@ledgerly/contracts"

const TAX_RATE_BY_REGION: Record<string, number> = {
  "US-CA": 0.0725,
  "US-NY": 0.08875,
  "US-TX": 0.0625,
  "DE": 0.19,
  "GB": 0.2,
  "JP": 0.1,
  "IN": 0.18,
}

export interface PriceBreakdown {
  currency: CurrencyCode
  fxRate: number
  subtotalCents: Cents
  taxCents: Cents
  totalCents: Cents
}

/**
 * Price an order in the customer's currency. Catalog prices are USD cents;
 * the subtotal is converted with the locked-in FX rate before tax is applied.
 */
export function priceOrder(
  lineItems: LineItem[],
  region: string,
  currency: CurrencyCode,
  fxRate: number,
): PriceBreakdown {
  const subtotalUsdCents = addCents(...lineItems.map(item => item.unitPriceCents * item.quantity))
  const subtotalCents = convertFromUsd(subtotalUsdCents, currency, fxRate)
  const taxCents = applyRate(subtotalCents, TAX_RATE_BY_REGION[region] ?? 0)
  return { currency, fxRate, subtotalCents, taxCents, totalCents: addCents(subtotalCents, taxCents) }
}
