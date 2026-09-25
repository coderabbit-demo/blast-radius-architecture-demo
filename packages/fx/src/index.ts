import { Redis } from "ioredis"
import type { CurrencyCode } from "@ledgerly/money"

/**
 * Live foreign-exchange rates from the Frankfurter API (ECB reference rates),
 * cached in Redis for an hour so we don't hit the provider on every checkout.
 */

const FX_API_BASE = process.env.FX_API_BASE ?? "https://api.frankfurter.app"
const CACHE_TTL_SECONDS = 60 * 60

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379")

interface FrankfurterResponse {
  base: string
  date: string
  rates: Record<string, number>
}

/** Returns how many units of `to` one unit of `from` buys. */
export async function getFxRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
  if (from === to) return 1

  const cacheKey = `fx:${from}:${to}`
  const cached = await redis.get(cacheKey)
  if (cached) return Number(cached)

  const res = await fetch(`${FX_API_BASE}/latest?from=${from}&to=${to}`)
  const body = (await res.json()) as FrankfurterResponse
  const rate = body.rates[to]

  await redis.set(cacheKey, String(rate), "EX", CACHE_TTL_SECONDS)
  return rate
}
