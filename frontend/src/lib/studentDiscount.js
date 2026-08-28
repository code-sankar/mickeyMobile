/**
 * The maths behind the student offer.
 *
 * Kept out of the components so the calculator, the tier table and the
 * registration summary all agree on what a given bill is worth.
 */
import { discountTiers, MINIMUM_SPEND, MINIMUM_AGE, MAXIMUM_AGE } from '../data/students'

/**
 * The advertised range, lowest first.
 *
 * Derived rather than written down, and sorted rather than read off the ends
 * of `discountTiers`, because the tiers are ordered by bill size and the
 * percentage now falls as the bill rises — taking the first and last would
 * print "10–7%".
 */
export const percentRange = () => {
  const percents = discountTiers.map((t) => t.percent)
  return { lowest: Math.min(...percents), highest: Math.max(...percents) }
}

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

/** Inside the offer's age window, inclusive at both ends. */
export const isAgeEligible = (dateString) => {
  const age = ageFrom(dateString)
  return age !== null && age >= MINIMUM_AGE && age <= MAXIMUM_AGE
}

const toIsoDate = (d) => {
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

/** The latest date of birth that still clears the age floor — the picker's `max`. */
export function latestEligibleDob(today = new Date()) {
  const d = new Date(today)
  d.setFullYear(d.getFullYear() - MINIMUM_AGE)
  return toIsoDate(d)
}

/**
 * The earliest date of birth still inside the ceiling — the picker's `min`.
 *
 * `MAXIMUM_AGE + 1` years ago is the day someone turns 29, which is already
 * outside the window, so the first eligible birthday is the day after that.
 */
export function earliestEligibleDob(today = new Date()) {
  const d = new Date(today)
  d.setFullYear(d.getFullYear() - (MAXIMUM_AGE + 1))
  d.setDate(d.getDate() + 1)
  return toIsoDate(d)
}
