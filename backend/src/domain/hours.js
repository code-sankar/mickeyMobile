/**
 * Live open/closed state for the shop.
 *
 * Port of the frontend's `src/lib/hours.js` with one deliberate change: the
 * browser version reads the *visitor's* clock, which tells someone in London
 * the shop is open at 3am IST. The server answers in the shop's own timezone,
 * so `/site/status` is the authoritative one.
 */

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

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

/** Day index and minutes-since-midnight for an instant, in a given timezone. */
export function zonedNow(date = new Date(), timeZone = 'UTC') {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )

  return {
    dayIndex: DAY_INDEX[parts.weekday] ?? date.getUTCDay(),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    time: `${parts.hour}:${parts.minute}`,
  }
}

/**
 * Returns today's row plus the badge sentence the header renders.
 * `hours` rows are `{ day, short, dayIndex, open, close }`.
 */
export function getOpenState(hours, now = new Date(), timeZone = 'UTC') {
  const { dayIndex, minutes, time } = zonedNow(now, timeZone)
  const today = hours.find((h) => h.dayIndex === dayIndex) ?? null

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
        closingSoon,
        minutesUntilClose: closes - minutes,
        localTime: time,
        timeZone,
      }
    }

    if (minutes < opens) {
      return {
        open: false,
        today,
        label: 'Closed',
        detail: `Opens ${to12h(today.open)} today`,
        closingSoon: false,
        minutesUntilOpen: opens - minutes,
        localTime: time,
        timeZone,
      }
    }
  }

  // Walk forward to the next day the shop opens.
  for (let step = 1; step <= 7; step += 1) {
    const next = hours.find((h) => h.dayIndex === (dayIndex + step) % 7)
    if (next) {
      return {
        open: false,
        today,
        label: 'Closed',
        detail: `Opens ${step === 1 ? 'tomorrow' : next.day} at ${to12h(next.open)}`,
        closingSoon: false,
        nextOpen: { day: next.day, at: next.open, inDays: step },
        localTime: time,
        timeZone,
      }
    }
  }

  return {
    open: false,
    today,
    label: 'Closed',
    detail: 'Check back soon',
    closingSoon: false,
    localTime: time,
    timeZone,
  }
}

/** Is the shop open on a given YYYY-MM-DD? Used to reject bookings on closed days. */
export function isOpenOnDate(hours, isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return false
  return hours.some((h) => h.dayIndex === date.getUTCDay())
}

/** Today in the shop's timezone as YYYY-MM-DD — the floor for a booking date. */
export function todayISO(now = new Date(), timeZone = 'UTC') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
