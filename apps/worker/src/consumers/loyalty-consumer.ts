import type { LedgerlyEvent } from "@ledgerly/contracts"
import { query } from "@ledgerly/db"

/** 1 loyalty point per whole dollar spent; refunds claw points back. */
export async function handleLoyalty(event: LedgerlyEvent): Promise<void> {
  if (event.type === "order.placed") {
    const points = Math.floor(event.totalCents / 100)
    await query(`UPDATE customers SET loyalty_points = loyalty_points + $2 WHERE id = $1`, [event.customerId, points])
  }
  if (event.type === "order.refunded") {
    const points = Math.floor(event.refundCents / 100)
    await query(
      `UPDATE customers SET loyalty_points = GREATEST(loyalty_points - $2, 0) WHERE id = $1`,
      [event.customerId, points],
    )
  }
}
