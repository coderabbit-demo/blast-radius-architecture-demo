import { query } from "@ledgerly/db"
import { formatUsd } from "@ledgerly/money"

/**
 * Compares yesterday's paid orders with generated invoices. Finance relies on
 * this to catch dropped events between apps/api and apps/worker.
 */
export async function runNightlyReconciliation(): Promise<void> {
  const [orders] = await query<{ total: string }>(
    `SELECT COALESCE(SUM(total_cents), 0) AS total
       FROM orders
      WHERE status = 'paid' AND created_at >= now() - interval '1 day'`,
  )
  const [invoices] = await query<{ total: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM invoices
      WHERE created_at >= now() - interval '1 day'`,
  )

  const drift = Number(orders.total) - Number(invoices.total)
  if (drift !== 0) {
    console.error(`[reconciliation] drift of ${formatUsd(drift)} between orders and invoices`)
    process.exitCode = 1
  } else {
    console.log(`[reconciliation] ok — ${formatUsd(Number(orders.total))} reconciled`)
  }
}
