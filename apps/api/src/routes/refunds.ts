import { randomUUID } from "node:crypto"
import { Router, type Router as ExpressRouter } from "express"
import Stripe from "stripe"
import { ORDER_EVENTS_STREAM, type OrderRefundedEvent } from "@ledgerly/contracts"
import { findOrder, query, setOrderStatus } from "@ledgerly/db"
import { toCents } from "@ledgerly/money"
import { publish } from "@ledgerly/queue"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")

export const refundsRouter: ExpressRouter = Router()

refundsRouter.post("/", async (req, res) => {
  const { orderId, amountDollars, reason } = req.body as {
    orderId: string
    amountDollars: number
    reason: string
  }

  const order = await findOrder(orderId)
  if (!order || order.status !== "paid") return res.status(409).json({ error: "order_not_refundable" })

  const refundCents = toCents(amountDollars)
  if (refundCents > order.totalCents) return res.status(400).json({ error: "refund_exceeds_total" })

  await stripe.refunds.create({ payment_intent: order.stripePaymentIntent!, amount: refundCents })
  await query(
    `INSERT INTO refunds (id, order_id, amount_cents, reason) VALUES ($1, $2, $3, $4)`,
    [randomUUID(), orderId, refundCents, reason],
  )
  await setOrderStatus(orderId, "refunded")

  const event: OrderRefundedEvent = {
    type: "order.refunded",
    orderId,
    customerId: order.customerId,
    refundCents,
    reason,
    refundedAt: new Date().toISOString(),
  }
  await publish(ORDER_EVENTS_STREAM, event)

  res.json({ ok: true, refundCents })
})
