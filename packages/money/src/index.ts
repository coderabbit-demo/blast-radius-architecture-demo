/**
 * Money helpers shared by every Ledgerly service.
 *
 * Amounts are stored and transported as integer **minor units of the order's
 * currency** (cents for USD/EUR, whole yen for JPY) to avoid floating-point
 * drift. Always carry the currency code alongside an amount.
 */

/** Integer amount in the minor unit of its currency. */
export type Cents = number

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "INR"

export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = ["USD", "EUR", "GBP", "JPY", "INR"]

/** ISO 4217 minor-unit exponent. */
const CURRENCY_EXPONENT: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  INR: 2,
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

/** Convert a user-entered dollar amount (e.g. 19.99) to integer cents. */
export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100)
}

/** Convert a major-unit amount (e.g. 19.99 EUR, 1500 JPY) to integer minor units. */
export function toMinorUnits(amount: number, currency: CurrencyCode): Cents {
  return Math.round(amount * 10 ** CURRENCY_EXPONENT[currency])
}

/** Sum a list of minor-unit amounts. */
export function addCents(...amounts: Cents[]): Cents {
  return amounts.reduce((total, amount) => total + amount, 0)
}

/** Apply a percentage rate (e.g. 0.0825 for 8.25%) and round half-up to the minor unit. */
export function applyRate(amount: Cents, rate: number): Cents {
  return Math.round(amount * rate)
}

/**
 * Convert a USD-cent amount into minor units of `to` using an FX rate
 * expressed as "1 USD = rate units of `to`".
 */
export function convertFromUsd(amountUsdCents: Cents, to: CurrencyCode, rate: number): Cents {
  const majorUnits = (amountUsdCents / 100) * rate
  return toMinorUnits(majorUnits, to)
}

/** Format minor units for display, e.g. (1999, "EUR") -> "€19.99". */
export function formatMoney(amount: Cents, currency: CurrencyCode): string {
  const exponent = CURRENCY_EXPONENT[currency]
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(amount / 10 ** exponent)
}

/** Format cents for display, e.g. 1999 -> "$19.99". */
export function formatUsd(amount: Cents): string {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  return `${sign}$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`
}
