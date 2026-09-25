import { addCents, applyRate, type Cents } from "@ledgerly/money"
import type { LineItem } from "@ledgerly/contracts"

const TAX_RATE_BY_REGION: Record<string, number> = {
  "US-CA": 0.0725,
  "US-NY": 0.08875,
  "US-TX": 0.0625,
}

export interface PriceBreakdown {
  subtotalCents: Cents
  taxCents: Cents
  totalCents: Cents
}

export function priceOrder(lineItems: LineItem[], region: string): PriceBreakdown {
  const subtotalCents = addCents(...lineItems.map(item => item.unitPriceCents * item.quantity))
  const taxCents = applyRate(subtotalCents, TAX_RATE_BY_REGION[region] ?? 0)
  return { subtotalCents, taxCents, totalCents: addCents(subtotalCents, taxCents) }
}
