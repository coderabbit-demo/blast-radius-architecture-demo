import type { LedgerlyEvent } from "@ledgerly/contracts"
import { addCents, formatUsd } from "@ledgerly/money"

let pendingSettlementCents = 0

/** Tracks the running amount owed to the merchant for the next payout batch. */
export async function handleSettlement(event: LedgerlyEvent): Promise<void> {
  if (event.type === "order.placed") {
    pendingSettlementCents = addCents(pendingSettlementCents, event.subtotalCents)
  } else if (event.type === "order.refunded") {
    pendingSettlementCents = addCents(pendingSettlementCents, -event.refundCents)
  }
  console.log(`[settlement] pending payout ${formatUsd(pendingSettlementCents)}`)
}
