import { query } from "./client.js"

export interface OrderRow {
  id: string
  customerId: string
  status: "pending" | "paid" | "refunded" | "failed"
  subtotalCents: number
  taxCents: number
  totalCents: number
  stripePaymentIntent: string | null
  createdAt: Date
}

const SELECT_ORDER = `
  SELECT id,
         customer_id           AS "customerId",
         status,
         subtotal_cents        AS "subtotalCents",
         tax_cents             AS "taxCents",
         total_cents           AS "totalCents",
         stripe_payment_intent AS "stripePaymentIntent",
         created_at            AS "createdAt"
    FROM orders`

export async function insertOrder(order: Omit<OrderRow, "status" | "createdAt" | "stripePaymentIntent">): Promise<void> {
  await query(
    `INSERT INTO orders (id, customer_id, subtotal_cents, tax_cents, total_cents)
     VALUES ($1, $2, $3, $4, $5)`,
    [order.id, order.customerId, order.subtotalCents, order.taxCents, order.totalCents],
  )
}

export async function findOrder(id: string): Promise<OrderRow | undefined> {
  const rows = await query<OrderRow>(`${SELECT_ORDER} WHERE id = $1`, [id])
  return rows[0]
}

export async function findOrderByPaymentIntent(paymentIntentId: string): Promise<OrderRow | undefined> {
  const rows = await query<OrderRow>(`${SELECT_ORDER} WHERE stripe_payment_intent = $1`, [paymentIntentId])
  return rows[0]
}

export async function setOrderStatus(id: string, status: OrderRow["status"]): Promise<void> {
  await query(`UPDATE orders SET status = $2 WHERE id = $1`, [id, status])
}

export async function attachPaymentIntent(id: string, paymentIntentId: string): Promise<void> {
  await query(`UPDATE orders SET stripe_payment_intent = $2 WHERE id = $1`, [id, paymentIntentId])
}
