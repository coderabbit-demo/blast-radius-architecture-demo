import { useEffect, useState } from "react"
import type { LineItem } from "@ledgerly/contracts"
import { getFxRate } from "@ledgerly/fx"
import { SUPPORTED_CURRENCIES, formatMoney, convertFromUsd, type CurrencyCode } from "@ledgerly/money"
import { OrderSummary } from "../components/OrderSummary.js"

interface PlacedOrder {
  orderId: string
  currency: CurrencyCode
  fxRate: number
  subtotalCents: number
  taxCents: number
  totalCents: number
}

export function CheckoutPage({ customerId, cart }: { customerId: string; cart: LineItem[] }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [previewRate, setPreviewRate] = useState(1)
  const [order, setOrder] = useState<PlacedOrder | null>(null)

  // Show the converted estimate as soon as the shopper picks a currency.
  useEffect(() => {
    getFxRate("USD", currency).then(setPreviewRate)
  }, [currency])

  const estimateUsdCents = cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)

  async function placeOrder() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId, lineItems: cart, region: "US-CA", currency }),
    })
    setOrder(await res.json())
  }

  if (order) return <OrderSummary lineItems={cart} {...order} />
  return (
    <div>
      <select value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}>
        {SUPPORTED_CURRENCIES.map(code => (
          <option key={code}>{code}</option>
        ))}
      </select>
      <p>Estimated total: {formatMoney(convertFromUsd(estimateUsdCents, currency, previewRate), currency)}</p>
      <button onClick={placeOrder}>Place order</button>
    </div>
  )
}
