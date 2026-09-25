import { ORDER_EVENTS_STREAM } from "@ledgerly/contracts"
import { consume } from "@ledgerly/queue"
import { handleInvoice } from "./consumers/invoice-consumer.js"
import { handleLoyalty } from "./consumers/loyalty-consumer.js"
import { handleSettlement } from "./consumers/settlement-consumer.js"

const consumerId = process.env.HOSTNAME ?? "worker-1"

await Promise.all([
  consume(ORDER_EVENTS_STREAM, "invoicing", consumerId, handleInvoice),
  consume(ORDER_EVENTS_STREAM, "loyalty", consumerId, handleLoyalty),
  consume(ORDER_EVENTS_STREAM, "settlement", consumerId, handleSettlement),
])
