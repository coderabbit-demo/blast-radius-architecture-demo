import { randomUUID } from "node:crypto"
import { Router, type Router as ExpressRouter } from "express"
import Stripe from "stripe"
import { ORDER_EVENTS_STREAM, type LineItem, type OrderPlacedEvent } from "@ledgerly/contracts"
import { attachPaymentIntent, findOrder, insertOrder } from "@ledgerly/db"
import { getFxRate } from "@ledgerly/fx"
import { isCurrencyCode } from "@ledgerly/money"
import { publish } from "@ledgerly/queue"
import { priceOrder } from "../services/pricing.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "")

export const ordersRouter: ExpressRouter = Router()

ordersRouter.post("/", async (req, res) => {
  const { customerId, lineItems, region, currency = "USD" } = req.body as {
    customerId: string
    lineItems: LineItem[]
    region: string
    currency?: string
  }
  if (!isCurrencyCode(currency)) return res.status(400).json({ error: "unsupported_currency" })

  const orderId = randomUUID()
  const fxRate = await getFxRate("USD", currency)
  const price = priceOrder(lineItems, region, currency, fxRate)

  await insertOrder({ id: orderId, customerId, ...price })

  const intent = await stripe.paymentIntents.create({
    amount: price.totalCents,
    currency: currency.toLowerCase(),
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
