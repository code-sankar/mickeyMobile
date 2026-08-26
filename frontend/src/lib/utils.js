/** Tiny classname joiner — keeps conditional Tailwind strings readable. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/**
 * Indian Rupee formatting (lakh/crore grouping).
 * Swap the locale + currency here to re-price the whole site for another market.
 */
export const CURRENCY = { locale: 'en-IN', symbol: '₹' }

export function money(value) {
  return CURRENCY.symbol + Number(value).toLocaleString(CURRENCY.locale, { maximumFractionDigits: 0 })
}

/** Percentage saved off MRP, rounded to a whole number. */
export function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

/** Stable pseudo-random ticket id, e.g. MM-4821. */
export function ticketId() {
  return `MM-${Math.floor(1000 + Math.random() * 8999)}`
}
