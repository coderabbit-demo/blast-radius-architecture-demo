import { Router, type Router as ExpressRouter } from "express"
import Stripe from "stripe"
import { findOrderByPaymentIntent, setOrderStatus } from "@ledgerly/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")

export const stripeWebhookRouter: ExpressRouter = Router()

stripeWebhookRouter.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"] as string
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "")
  } catch {
    return res.status(400).send("invalid signature")
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object
    const order = await findOrderByPaymentIntent(intent.id)
    if (!order) return res.status(404).send("unknown order")

    // Guard against tampered or partial captures: the captured amount must
    // match what we priced the order at.
    if (intent.amount_received !== order.totalCents) {
      await setOrderStatus(order.id, "failed")
      return res.status(422).send("amount mismatch")
    }
    await setOrderStatus(order.id, "paid")
  }

  res.json({ received: true })
})
