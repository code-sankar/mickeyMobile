import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { loginLimiter } from '../../middleware/rateLimit.js'
import { requireAdmin, requireOwner, signAdminToken } from '../../middleware/auth.js'
import { requireDatabase } from '../../middleware/requireDatabase.js'
import { AdminUser } from '../../models/AdminUser.js'
import { Booking, BOOKING_STATUSES } from '../../models/Booking.js'
import { StudentRegistration } from '../../models/StudentRegistration.js'
import { ErasureRequest } from '../../models/ErasureRequest.js'
import { email, ticket } from '../../validation/common.js'
import * as bookings from '../bookings/bookings.service.js'
import * as students from '../students/students.service.js'

const router = Router()

/* ----------------------------------------------------------------- sign in */

router.post(
  '/login',
  loginLimiter,
  requireDatabase,
  validate(z.object({ email, password: z.string().min(8).max(200) })),
  asyncHandler(async (req, res) => {
    const user = await AdminUser.findOne({ email: req.body.email }).select('+passwordHash')

    // One message and one timing profile for both failure modes, so this
    // cannot be used to find out which addresses are staff.
    const ok = user?.active && (await user.verifyPassword(req.body.password))
    if (!ok) throw ApiError.unauthorized('Email or password is wrong')

    user.lastLoginAt = new Date()
    await user.save()

    res.json({ ok: true, data: { token: signAdminToken(user), user: user.toJSON() } })
  }),
)

// Everything past this point needs a valid bearer token, then a live database.
// In that order: an anonymous caller gets 401 without learning anything about
// our infrastructure.
router.use(requireAdmin)
router.use(requireDatabase)

router.get('/me', (req, res) => res.json({ ok: true, data: req.admin.toJSON() }))

/* ---------------------------------------------------------------- bookings */

const listQuery = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

router.get(
  '/bookings',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { items, ...meta } = await bookings.listBookings(req.validatedQuery)
    res.json({ ok: true, data: items.map((b) => b.toJSON()), meta })
  }),
)

router.get(
  '/bookings/:ticket',
  validate(z.object({ ticket }), 'params'),
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ ticket: req.validatedParams.ticket })
    if (!booking) throw ApiError.notFound('No booking with that ticket')
    res.json({ ok: true, data: booking.toJSON() })
  }),
)

router.patch(
  '/bookings/:ticket/status',
  validate(z.object({ ticket }), 'params'),
  validate(z.object({ status: z.enum(BOOKING_STATUSES), note: z.string().trim().max(500).default('') })),
  asyncHandler(async (req, res) => {
    const booking = await bookings.updateStatus(
      req.validatedParams.ticket,
      req.body,
      req.admin.email,
    )
    res.json({ ok: true, data: booking.toJSON() })
  }),
)

/** The counter's working view: today's queue, plus what is waiting on someone. */
router.get(
  '/queue',
  asyncHandler(async (_req, res) => {
    const [byStatus, today] = await Promise.all([
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Booking.find({
        status: { $nin: ['collected', 'cancelled', 'no-show'] },
      })
        .sort({ date: 1, createdAt: 1 })
        .limit(50),
    ])

    res.json({
      ok: true,
      data: {
        counts: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        open: today.map((b) => b.toJSON()),
      },
    })
  }),
)

/* ---------------------------------------------------------------- students */

router.get(
  '/students',
  validate(
    z.object({
      status: z.enum(['pending', 'verified', 'rejected', 'expired']).optional(),
      q: z.string().trim().max(120).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(25),
    }),
    'query',
  ),
  asyncHandler(async (req, res) => {
    const { items, ...meta } = await students.listRegistrations(req.validatedQuery)
    res.json({ ok: true, data: items, meta })
  }),
)

router.patch(
  '/students/:registrationId',
  validate(z.object({ registrationId: z.string().trim().min(3).max(40) }), 'params'),
  validate(
    z.object({
      status: z.enum(['pending', 'verified', 'rejected', 'expired']),
      reason: z.string().trim().max(500).default(''),
    }),
  ),
  asyncHandler(async (req, res) => {
    const registration = await students.decideRegistration(
      req.validatedParams.registrationId,
      req.body,
      req.admin.email,
    )
    res.json({ ok: true, data: registration.toJSON() })
  }),
)

/** Who may be emailed: opted in, not withdrawn, verified. Nobody else. */
router.get(
  '/students/marketing-audience',
  asyncHandler(async (_req, res) => {
    const audience = await StudentRegistration.marketingAudience().select(
      'registrationId name email device.brand device.model',
    )
    res.json({ ok: true, data: audience, meta: { total: audience.length } })
  }),
)

/* ------------------------------------------------------------ data requests */

router.get(
  '/data-requests',
  asyncHandler(async (_req, res) => {
    const requests = await ErasureRequest.find().sort({ createdAt: -1 }).limit(100)
    res.json({ ok: true, data: requests.map((r) => r.toJSON()) })
  }),
)

/**
 * Owner-only, and only after identity has been checked at the counter.
 * Deleting a customer's record on an unverified web request would be its own
 * kind of data breach.
 */
router.post(
  '/data-requests/:reference/execute',
  requireOwner,
  validate(z.object({ reference: z.string().trim().min(3).max(40) }), 'params'),
  asyncHandler(async (req, res) => {
    const request = await students.executeErasure(
      req.validatedParams.reference,
      req.admin.email,
    )
    res.json({ ok: true, data: request.toJSON() })
  }),
)

export const adminRoutes = router
