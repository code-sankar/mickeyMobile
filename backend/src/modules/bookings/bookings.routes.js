import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { writeLimiter } from '../../middleware/rateLimit.js'
import { phone, isoDate, ticket } from '../../validation/common.js'
import { quoteSchema } from '../repairs/repairs.routes.js'
import * as bookings from './bookings.service.js'

const router = Router()

/**
 * Mirrors `BookingModal`'s own validate(), message for message — including
 * "Who do we ask for?" for a missing name, which is the copy the field shows.
 *
 * `quote` is the estimator's *selection*, not its output. Sending a price here
 * would be sending the server a number it is about to overwrite.
 */
export const bookingCreateSchema = z.object({
  // Spelled out rather than reusing `personName`, because this form words the
  // same rule differently ("Who do we ask for?" vs "Required") and a refine
  // layered on top would never run — the base message short-circuits first.
  name: z.string().trim().min(2, 'Who do we ask for?').max(120),
  phone,
  // Same reason: this form calls a missing date "Pick a day". Whether it is in
  // the past is decided server-side, in the shop's timezone — see the service.
  date: z
    .string({ message: 'Pick a day' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a day')
    .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), 'Pick a day'),
  slot: z.string().trim().min(1, 'Choose a slot'),
  mode: z.enum(['walkin', 'dropoff', 'pickup']).catch('walkin'),
  notes: z.string().trim().max(1000).default(''),
  quote: quoteSchema.nullish().default(null),
})

export const bookingLookupSchema = z.object({ ticket, phone })

router.post(
  '/',
  writeLimiter,
  validate(bookingCreateSchema),
  asyncHandler(async (req, res) => {
    const booking = await bookings.createBooking(req.body, { ip: req.ip, source: 'web' })
    res.status(201).json({
      ok: true,
      data: booking.toJSON(),
      // The confirmation screen prints the ticket and offers a WhatsApp
      // handoff; the shop still confirms there, so say so rather than
      // implying the slot is locked.
      message: 'Booking received — we confirm on WhatsApp within 15 minutes during shop hours.',
    })
  }),
)

router.get(
  '/availability',
  validate(z.object({ date: isoDate }), 'query'),
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: await bookings.slotAvailability(req.validatedQuery.date) })
  }),
)

/**
 * Status lookup takes the phone number as well as the ticket — see
 * `findForCustomer`. A POST keeps the number out of access logs and browser
 * history, which a query string would not.
 */
router.post(
  '/lookup',
  writeLimiter,
  validate(bookingLookupSchema),
  asyncHandler(async (req, res) => {
    const booking = await bookings.findForCustomer(req.body.ticket, req.body.phone)
    res.json({ ok: true, data: booking.toJSON() })
  }),
)

export const bookingsRoutes = router
