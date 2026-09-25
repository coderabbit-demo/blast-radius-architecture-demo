import { useState } from "react"
import type { LineItem } from "@ledgerly/contracts"
import { OrderSummary } from "../components/OrderSummary.js"

interface PlacedOrder {
  orderId: string
  subtotalCents: number
  taxCents: number
  totalCents: number
}

export function CheckoutPage({ customerId, cart }: { customerId: string; cart: LineItem[] }) {
  const [order, setOrder] = useState<PlacedOrder | null>(null)

  async function placeOrder() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId, lineItems: cart, region: "US-CA" }),
    })
    setOrder(await res.json())
  }

  if (!order) return <button onClick={placeOrder}>Place order</button>
  return <OrderSummary lineItems={cart} {...order} />
}
