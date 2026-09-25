import { formatUsd } from "@ledgerly/money"
import type { LineItem } from "@ledgerly/contracts"

export interface OrderSummaryProps {
  lineItems: LineItem[]
  subtotalCents: number
  taxCents: number
  totalCents: number
}

export function OrderSummary({ lineItems, subtotalCents, taxCents, totalCents }: OrderSummaryProps) {
  return (
    <section aria-label="Order summary">
      <ul>
        {lineItems.map(item => (
          <li key={item.sku}>
            {item.sku} × {item.quantity} — {formatUsd(item.unitPriceCents * item.quantity)}
          </li>
        ))}
      </ul>
      <dl>
        <dt>Subtotal</dt>
        <dd>{formatUsd(subtotalCents)}</dd>
        <dt>Tax</dt>
        <dd>{formatUsd(taxCents)}</dd>
        <dt>Total</dt>
        <dd><strong>{formatUsd(totalCents)}</strong></dd>
      </dl>
    </section>
  )
}
