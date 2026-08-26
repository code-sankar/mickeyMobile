/**
 * The maths behind the student offer.
 *
 * Kept out of the components so the calculator, the tier table and the
 * registration summary all agree on what a given bill is worth.
 */
import { discountTiers, MINIMUM_SPEND, MINIMUM_AGE } from '../data/students'

/** The band a bill falls into, or null when it is under the minimum spend. */
export function tierForAmount(amount) {
  if (!Number.isFinite(amount) || amount < MINIMUM_SPEND) return null
  return (
    discountTiers.find((t) => amount >= t.min && (t.max === null || amount <= t.max)) ?? null
  )
}

/**
 * What a bill becomes once the discount lands.
 * Returns nulls rather than throwing so the calculator can render an
 * "not eligible yet" state from the same shape.
 */
export function savingsFor(amount) {
  const tier = tierForAmount(amount)
  if (!tier) {
    return { tier: null, percent: 0, saved: 0, payable: amount || 0, eligible: false }
  }
  // Rounded to the rupee — the counter does not deal in paise.
  const saved = Math.round((amount * tier.percent) / 100)
  return { tier, percent: tier.percent, saved, payable: amount - saved, eligible: true }
}

/** Whole years between a date of birth and today. */
export function ageFrom(dateString) {
  if (!dateString) return null
  const dob = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return null

  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1
  return age
}

export const isOldEnough = (dateString) => {
  const age = ageFrom(dateString)
  return age !== null && age >= MINIMUM_AGE
}

/** The latest date of birth that still clears the age gate — caps the date picker. */
export function latestEligibleDob(today = new Date()) {
  const d = new Date(today)
  d.setFullYear(d.getFullYear() - MINIMUM_AGE)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}
