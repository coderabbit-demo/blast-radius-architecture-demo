import { randomUUID } from "node:crypto"
import type { LedgerlyEvent } from "@ledgerly/contracts"
import { query } from "@ledgerly/db"
import { formatUsd } from "@ledgerly/money"

/** Generates an invoice record for every placed order. */
export async function handleInvoice(event: LedgerlyEvent): Promise<void> {
  if (event.type !== "order.placed") return

  const lines = event.lineItems.map(
    item => `${item.sku} x${item.quantity} @ ${formatUsd(item.unitPriceCents)}`,
  )
  console.log(`[invoice] ${event.orderId}\n  ${lines.join("\n  ")}\n  total ${formatUsd(event.totalCents)}`)

  await query(
    `INSERT INTO invoices (id, order_id, amount_cents) VALUES ($1, $2, $3)`,
    [randomUUID(), event.orderId, event.totalCents],
  )
}
