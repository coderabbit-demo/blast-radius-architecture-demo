import { formatMoney, type CurrencyCode } from "@ledgerly/money"
import type { LineItem } from "@ledgerly/contracts"

export interface OrderSummaryProps {
  lineItems: LineItem[]
  currency: CurrencyCode
  fxRate: number
  subtotalCents: number
  taxCents: number
  totalCents: number
}

export function OrderSummary({ lineItems, currency, fxRate, subtotalCents, taxCents, totalCents }: OrderSummaryProps) {
  return (
    <section aria-label="Order summary">
      <ul>
        {lineItems.map(item => (
          <li key={item.sku}>
            {item.sku} × {item.quantity} — {formatMoney(Math.round(item.unitPriceCents * item.quantity * fxRate), currency)}
          </li>
        ))}
      </ul>
      <dl>
        <dt>Subtotal</dt>
        <dd>{formatMoney(subtotalCents, currency)}</dd>
        <dt>Tax</dt>
        <dd>{formatMoney(taxCents, currency)}</dd>
        <dt>Total</dt>
        <dd><strong>{formatMoney(totalCents, currency)}</strong></dd>
      </dl>
    </section>
  )
}
