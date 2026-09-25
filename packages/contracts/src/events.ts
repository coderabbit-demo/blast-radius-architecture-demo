import type { Cents, CurrencyCode } from "@ledgerly/money"

/**
 * Domain events published on the Redis event bus.
 *
 * These payloads are serialized as JSON and consumed asynchronously by
 * apps/worker. Consumers are deployed independently of producers, so any
 * change to a field name or type is a breaking change on the wire.
 */

export interface LineItem {
  sku: string
  quantity: number
  unitPriceCents: Cents
}

export interface OrderPlacedEvent {
  type: "order.placed"
  orderId: string
  customerId: string
  /** Currency the customer is charged in. All `*Cents` amounts below are minor units of this currency. */
  currency: CurrencyCode
  /** USD -> `currency` rate locked in at checkout. */
  fxRate: number
  /** Catalog prices; `unitPriceCents` is always USD cents. */
  lineItems: LineItem[]
  subtotalCents: Cents
  taxCents: Cents
  totalCents: Cents
  placedAt: string
}

export interface OrderRefundedEvent {
  type: "order.refunded"
  orderId: string
  customerId: string
  refundCents: Cents
  reason: string
  refundedAt: string
}

export type LedgerlyEvent = OrderPlacedEvent | OrderRefundedEvent

export const ORDER_EVENTS_STREAM = "ledgerly:events:orders"
