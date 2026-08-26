import { hours } from '../data/site'

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const to12h = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

/**
 * Live open/closed state for the store, derived from the visitor's own clock.
 * Returns the row for today plus a human sentence for the badge.
 */
export function getOpenState(now = new Date()) {
  const day = now.getDay()
  const today = hours.find((h) => h.dayIndex === day)
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (today) {
    const opens = toMinutes(today.open)
    const closes = toMinutes(today.close)

    if (minutes >= opens && minutes < closes) {
      const closingSoon = closes - minutes <= 60
      return {
        open: true,
        today,
        label: closingSoon ? 'Closing soon' : 'Open now',
        detail: `Closes ${to12h(today.close)}`,
      }
    }

    if (minutes < opens) {
      return { open: false, today, label: 'Closed', detail: `Opens ${to12h(today.open)} today` }
    }
  }

  // Walk forward to the next day the shop opens
  for (let step = 1; step <= 7; step += 1) {
    const next = hours.find((h) => h.dayIndex === (day + step) % 7)
    if (next) {
      return {
        open: false,
        today,
        label: 'Closed',
        detail: `Opens ${step === 1 ? 'tomorrow' : next.day} at ${to12h(next.open)}`,
      }
    }
  }

  return { open: false, today, label: 'Closed', detail: 'Check back soon' }
}
