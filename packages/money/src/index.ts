/**
 * Money helpers shared by every Ledgerly service.
 *
 * All amounts are stored and transported as integer US cents to avoid
 * floating-point drift. Convert to dollars only at the presentation edge.
 */

export type Cents = number

/** Convert a user-entered dollar amount (e.g. 19.99) to integer cents. */
export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100)
}

/** Sum a list of cent amounts. */
export function addCents(...amounts: Cents[]): Cents {
  return amounts.reduce((total, amount) => total + amount, 0)
}

/** Apply a percentage rate (e.g. 0.0825 for 8.25%) and round half-up to the cent. */
export function applyRate(amount: Cents, rate: number): Cents {
  return Math.round(amount * rate)
}

/** Format cents for display, e.g. 1999 -> "$19.99". */
export function formatUsd(amount: Cents): string {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  return `${sign}$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`
}
