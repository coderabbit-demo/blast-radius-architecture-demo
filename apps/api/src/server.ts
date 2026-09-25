import express from "express"
import { ordersRouter } from "./routes/orders.js"
import { refundsRouter } from "./routes/refunds.js"
import { stripeWebhookRouter } from "./webhooks/stripe.js"

const app = express()

// Stripe needs the raw body for signature verification.
app.use("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookRouter)
app.use(express.json())
app.use("/orders", ordersRouter)
app.use("/refunds", refundsRouter)

app.get("/healthz", (_req, res) => res.json({ ok: true }))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`ledgerly api listening on :${port}`))
