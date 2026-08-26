/**
 * The student offer, as maths.
 *
 * Port of the frontend's `src/lib/studentDiscount.js`. The tiers themselves
 * live in MongoDB (seeded from `src/data/students.js`) so the offer can be
 * changed without a deploy; the rules for applying them live here.
 */

/** The band a bill falls into, or null when it is under the minimum spend. */
export function tierForAmount(amount, tiers, minimumSpend) {
  if (!Number.isFinite(amount) || amount < minimumSpend) return null
  return (
    tiers.find((t) => amount >= t.min && (t.max === null || t.max === undefined || amount <= t.max)) ??
    null
  )
}

/**
 * What a bill becomes once the discount lands.
 * Returns zeroed fields rather than throwing so an ineligible amount renders
 * from the same shape as an eligible one.
 */
export function savingsFor(amount, tiers, minimumSpend) {
  const tier = tierForAmount(amount, tiers, minimumSpend)
  if (!tier) {
    return {
      tier: null,
      percent: 0,
      saved: 0,
      payable: Number.isFinite(amount) ? amount : 0,
      eligible: false,
      shortfall: Number.isFinite(amount) ? Math.max(0, minimumSpend - amount) : minimumSpend,
    }
  }
  // Rounded to the rupee — the counter does not deal in paise.
  const saved = Math.round((amount * tier.percent) / 100)
  return {
    tier: { id: tier.id, label: tier.label, percent: tier.percent, blurb: tier.blurb },
    percent: tier.percent,
    saved,
    payable: amount - saved,
    eligible: true,
    shortfall: 0,
  }
}

/**
 * Whole years between a date of birth and a reference date.
 *
 * Parsed as UTC midnight rather than local so the same DOB does not yield a
 * different age on a server in another timezone than it did in the browser.
 */
export function ageFrom(dateString, now = new Date()) {
  if (!dateString) return null
  const dob = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(dob.getTime())) return null

  let age = now.getUTCFullYear() - dob.getUTCFullYear()
  const monthDelta = now.getUTCMonth() - dob.getUTCMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1
  return age
}

export const isOldEnough = (dateString, minimumAge, now = new Date()) => {
  const age = ageFrom(dateString, now)
  return age !== null && age >= minimumAge
}

/** The latest date of birth that still clears the age gate. */
export function latestEligibleDob(minimumAge, today = new Date()) {
  const d = new Date(today)
  d.setUTCFullYear(d.getUTCFullYear() - minimumAge)
  return d.toISOString().slice(0, 10)
}
