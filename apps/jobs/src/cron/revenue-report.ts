import { query } from "@ledgerly/db"
import { formatUsd } from "@ledgerly/money"

/** Weekly revenue digest emailed to finance. */
export async function runRevenueReport(): Promise<void> {
  const rows = await query<{ day: string; gross: string; refunds: string }>(
    `SELECT date_trunc('day', o.created_at)::date AS day,
            SUM(o.total_cents)                    AS gross,
            COALESCE(SUM(r.amount_cents), 0)      AS refunds
       FROM orders o
       LEFT JOIN refunds r ON r.order_id = o.id
      WHERE o.created_at >= now() - interval '7 days'
      GROUP BY 1
      ORDER BY 1`,
  )
  for (const row of rows) {
    const net = Number(row.gross) - Number(row.refunds)
    console.log(`${row.day}  gross ${formatUsd(Number(row.gross))}  net ${formatUsd(net)}`)
  }
}
