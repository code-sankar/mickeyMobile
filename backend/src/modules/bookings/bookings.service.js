import { Booking, CLOSED_STATUSES } from '../../models/Booking.js'
import { Setting } from '../../models/Setting.js'
import { nextTicketId } from '../../models/Counter.js'
import { ApiError } from '../../utils/ApiError.js'
import { env } from '../../config/env.js'
import { isOpenOnDate, todayISO } from '../../domain/hours.js'
import { quoteFor } from '../repairs/repairs.service.js'

/**
 * Flattens a full quote into the snapshot stored on the ticket.
 * Denormalised on purpose — the counter needs to read a ticket without
 * joining three collections, and needs it to say what it said on the day.
 */
const snapshot = (quote) => ({
  brandId: quote.brand.id,
  brandName: quote.brand.name,
  modelId: quote.model.id,
  modelName: quote.model.name,
  issueId: quote.issue.id,
  issueName: quote.issue.name,
  issueShort: quote.issue.short,
  gradeId: quote.grade.id,
  gradeLabel: quote.gradeLabel,
  price: quote.price,
  low: quote.low,
  turnaround: quote.turnaround,
  warranty: quote.warranty,
})

/**
 * Checks the parts of a booking that only the server can judge: that the slot
 * and mode are ones the shop actually offers, that the date is not in the past
 * *in the shop's timezone*, and that the shop is open that day.
 *
 * The date check is the reason this cannot be left to the browser — a customer
 * whose phone is set to Honolulu would otherwise book yesterday.
 */
async function assertSlotIsBookable({ date, slot, mode }) {
  const options = (await Setting.get('booking-options')) ?? {}
  const timeSlots = options.timeSlots ?? []
  const serviceModes = (options.serviceModes ?? []).map((m) => m.id)
  const hours = (await Setting.get('site'))?.hours ?? []

  const details = {}

  if (timeSlots.length && !timeSlots.includes(slot)) details.slot = 'Choose a slot'
  if (serviceModes.length && !serviceModes.includes(mode)) details.mode = 'Pick one'
  if (date < todayISO(new Date(), env.timezone)) details.date = 'Already passed'
  else if (hours.length && !isOpenOnDate(hours, date)) details.date = 'We are closed that day'

  if (Object.keys(details).length) {
    throw ApiError.unprocessable('Some details need another look', { details })
  }
}

/**
 * Creates a ticket.
 *
 * The client sends a *selection* (`quote: { brandId, modelId, issueId,
 * gradeId }`), never a price — the quote is rebuilt here from the live price
 * list and stored. That is the difference between a booking form and a
 * booking system: nothing a customer can edit in devtools reaches the counter.
 */
export async function createBooking(input, { ip = null, source = 'web' } = {}) {
  await assertSlotIsBookable(input)

  const quote = input.quote ? snapshot(await quoteFor(input.quote)) : null

  const ticket = await nextTicketId()

  const booking = await Booking.create({
    ticket,
    name: input.name,
    phone: input.phone,
    date: input.date,
    slot: input.slot,
    mode: input.mode,
    notes: input.notes ?? '',
    quote,
    status: 'pending',
    statusHistory: [{ status: 'pending', at: new Date(), by: source, note: 'Booked on the website' }],
    policyAcceptedAt: new Date(),
    source,
    submittedIp: ip,
  })

  return booking
}

/**
 * Customer-facing status lookup.
 *
 * Ticket *and* phone, because a ticket number is short, sequential and printed
 * on a card — guessable on its own. Requiring the number it was booked against
 * keeps one customer from reading another's ticket.
 */
export async function findForCustomer(ticket, phone) {
  const booking = await Booking.findOne({ ticket, phone })
  if (!booking) {
    // Deliberately the same answer for "no such ticket" and "wrong phone", so
    // the endpoint cannot be used to enumerate which tickets exist.
    throw ApiError.notFound('No booking matches that ticket and number')
  }
  return booking
}

/** Which slots on a date are already spoken for — lets the form grey them out. */
export async function slotAvailability(date) {
  const options = (await Setting.get('booking-options')) ?? {}
  const timeSlots = options.timeSlots ?? []
  const capacity = options.slotCapacity ?? 2

  const taken = await Booking.aggregate([
    { $match: { date, status: { $nin: CLOSED_STATUSES } } },
    { $group: { _id: '$slot', count: { $sum: 1 } } },
  ])
  const counts = Object.fromEntries(taken.map((t) => [t._id, t.count]))

  const hours = (await Setting.get('site'))?.hours ?? []
  const past = date < todayISO(new Date(), env.timezone)
  const closed = hours.length > 0 && !isOpenOnDate(hours, date)

  return {
    date,
    open: !past && !closed,
    reason: past ? 'Already passed' : closed ? 'We are closed that day' : null,
    slots: timeSlots.map((slot) => {
      const booked = counts[slot] ?? 0
      return {
        slot,
        booked,
        capacity,
        available: !past && !closed && booked < capacity,
      }
    }),
  }
}

export async function listBookings({ status, date, q, page = 1, limit = 25 }) {
  const filter = {}
  if (status) filter.status = status
  if (date) filter.date = date
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ ticket: rx }, { name: rx }, { phone: rx }]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Booking.find(filter).sort({ date: 1, createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ])

  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) }
}

export async function updateStatus(ticket, { status, note = '' }, by) {
  const booking = await Booking.findOne({ ticket })
  if (!booking) throw ApiError.notFound('No booking with that ticket')

  if (booking.status === status) {
    throw ApiError.conflict(`Ticket is already ${status}`)
  }

  booking.status = status
  booking.statusHistory.push({ status, at: new Date(), by, note })

  // The IP was only ever kept for abuse triage; a closed ticket has no use for it.
  if (CLOSED_STATUSES.includes(status)) booking.submittedIp = null

  await booking.save()
  return booking
}
