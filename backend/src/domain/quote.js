/**
 * The repair pricing rules.
 *
 * This is a port of the frontend's `src/data/selectors.js`, and it is now the
 * authoritative copy: a booking never accepts a price from the client, it
 * accepts a *selection* and recomputes the quote here. That is what stops a
 * tampered request from booking a ₹32,900 screen for ₹1.
 *
 * Keep `buildQuote` byte-for-byte equivalent to the frontend version — the
 * estimator renders one and the booking confirmation renders the other, and
 * a visitor must never see the two disagree.
 */

/** Walk-in rate for a model/issue pair at a given part grade, rounded to ₹100. */
export function priceFor(model, issue, grade) {
  if (!model || !issue) return null
  const base = model.prices?.[issue.id]
  if (!Number.isFinite(base)) return null
  const multiplier = issue.gradable ? grade.multiplier : 1
  return Math.round((base * multiplier) / 100) * 100
}

/**
 * The full customer-facing estimate for a selection.
 *
 * Returns `null` when any part of the selection does not resolve, so the
 * caller decides whether that is a 404 or a validation error.
 */
export function buildQuote({ brand, model, issue, grade }) {
  if (!brand || !model || !issue || !grade) return null

  const price = priceFor(model, issue, grade)
  if (price === null) return null

  return {
    brand: { id: brand.id, name: brand.name, accent: brand.accent },
    model: { id: model.id, name: model.name, year: model.year, display: model.display },
    issue: {
      id: issue.id,
      name: issue.name,
      short: issue.short,
      gradable: issue.gradable,
      sameDay: issue.sameDay,
    },
    grade: { id: grade.id, name: grade.name, warrantyDays: grade.warrantyDays },
    price,
    // The advertised range: the quote is a ceiling, and a simpler-than-
    // expected job lands at the low end. 7% under, rounded to ₹100.
    low: Math.round((price * 0.93) / 100) * 100,
    turnaround: issue.turnaround,
    warranty: issue.gradable ? `${grade.warrantyDays} days` : issue.warranty,
    gradeLabel: issue.gradable ? grade.name : 'Board-level service',
  }
}

/** Cheapest advertised rate for an issue across the whole catalogue. */
export function startingPriceFor(brands, issueId) {
  const all = brands
    .flatMap((b) => b.models.map((m) => m.prices?.[issueId]))
    .filter((n) => Number.isFinite(n) && n > 0)
  return all.length ? Math.min(...all) : null
}
