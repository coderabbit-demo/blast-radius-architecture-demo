import { randomUUID } from "node:crypto"
import { Router, type Router as ExpressRouter } from "express"
import Stripe from "stripe"
import { ORDER_EVENTS_STREAM, type LineItem, type OrderPlacedEvent } from "@ledgerly/contracts"
import { attachPaymentIntent, findOrder, insertOrder } from "@ledgerly/db"
import { publish } from "@ledgerly/queue"
import { priceOrder } from "../services/pricing.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")

export const ordersRouter: ExpressRouter = Router()

ordersRouter.post("/", async (req, res) => {
  const { customerId, lineItems, region } = req.body as {
    customerId: string
    lineItems: LineItem[]
    region: string
  }

  const orderId = randomUUID()
  const price = priceOrder(lineItems, region)

  await insertOrder({ id: orderId, customerId, ...price })

  const intent = await stripe.paymentIntents.create({
    amount: price.totalCents,
    currency: "usd",
    metadata: { orderId },
  })
  await attachPaymentIntent(orderId, intent.id)

  const event: OrderPlacedEvent = {
    type: "order.placed",
    orderId,
    customerId,
    lineItems,
    ...price,
    placedAt: new Date().toISOString(),
  }
  await publish(ORDER_EVENTS_STREAM, event)

  res.status(201).json({ orderId, clientSecret: intent.client_secret, ...price })
})

ordersRouter.get("/:id", async (req, res) => {
  const order = await findOrder(req.params.id)
  if (!order) return res.status(404).json({ error: "not_found" })
  res.json(order)
})
