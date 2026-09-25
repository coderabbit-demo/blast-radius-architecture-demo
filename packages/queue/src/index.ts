import { Redis } from "ioredis"
import type { LedgerlyEvent } from "@ledgerly/contracts"

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379")

export async function publish(stream: string, event: LedgerlyEvent): Promise<void> {
  await redis.xadd(stream, "*", "payload", JSON.stringify(event))
}

/**
 * Consume events from a stream with a consumer group. Payloads are parsed
 * from JSON — they are NOT validated against the TypeScript contract at runtime.
 */
export async function consume(
  stream: string,
  group: string,
  consumer: string,
  handler: (event: LedgerlyEvent) => Promise<void>,
): Promise<never> {
  await redis.xgroup("CREATE", stream, group, "$", "MKSTREAM").catch(() => undefined)
  for (;;) {
    const batches = (await redis.xreadgroup(
      "GROUP", group, consumer, "COUNT", 10, "BLOCK", 5000, "STREAMS", stream, ">",
    )) as [string, [string, string[]][]][] | null
    for (const [, entries] of batches ?? []) {
      for (const [id, fields] of entries) {
        const event = JSON.parse(fields[1]) as LedgerlyEvent
        await handler(event)
        await redis.xack(stream, group, id)
      }
    }
  }
}
