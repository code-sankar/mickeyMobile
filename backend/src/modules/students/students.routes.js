import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { writeLimiter } from '../../middleware/rateLimit.js'
import { personName, phone, email, isoDate } from '../../validation/common.js'
import * as students from './students.service.js'

const router = Router()

/**
 * Field for field, message for message, the same rules as
 * `useStudentRegistration.validate` — including the shape of the payload,
 * which stays flat (`deviceBrand`, not `device.brand`) so the form's own
 * `values` object can be posted without reshaping and a 422 comes back keyed
 * to the fields it already renders.
 */
export const studentRegisterSchema = z.object({
  name: personName,
  dob: isoDate,
  institution: z.string().trim().min(2, 'Required').max(160),
  phone,
  email,
  address: z.string().trim().min(10, 'Full address').max(500),
  deviceBrand: z.string().trim().min(1, 'Pick one').max(60),
  deviceModel: z.string().trim().min(2, 'Required').max(80),
  deviceAge: z.enum(['under-1', '1-2', '2-3', 'over-3'], { message: 'Pick one' }),
  issue: z.string().trim().max(1000).default(''),

  // The only consent that gates submission. Marketing is optional by design —
  // it defaults to off and its absence changes nothing about the discount.
  verification: z.literal(true, { message: 'Required to register' }),
  marketing: z.boolean().default(false),
})

router.get(
  '/offer',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: await students.offerTerms() })
  }),
)

router.get(
  '/savings',
  validate(z.object({ amount: z.coerce.number().min(0).max(10_000_000) }), 'query'),
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: await students.calculateSavings(req.validatedQuery.amount) })
  }),
)

router.post(
  '/register',
  writeLimiter,
  validate(studentRegisterSchema),
  asyncHandler(async (req, res) => {
    const registration = await students.register(req.body, { ip: req.ip, source: 'web' })
    res.status(201).json({
      ok: true,
      data: registration.toJSON(),
      message:
        'Registered — bring your student ID to the counter and we will verify it there. The card is never uploaded.',
    })
  }),
)

router.post(
  '/marketing/withdraw',
  writeLimiter,
  validate(z.object({ phone })),
  asyncHandler(async (req, res) => {
    await students.withdrawMarketing(req.body.phone)
    res.json({ ok: true, message: 'You will not get any more marketing messages from us.' })
  }),
)

/**
 * The "see, correct or delete what is held" promise on the students page,
 * given a route. Logged, then worked by staff after checking who is asking.
 */
router.post(
  '/data-request',
  writeLimiter,
  validate(
    z
      .object({
        kind: z.enum(['access', 'correction', 'erasure']),
        phone: phone.nullish(),
        email: email.nullish(),
        note: z.string().trim().max(1000).default(''),
      })
      .refine((v) => v.phone || v.email, {
        message: 'Phone or email required',
        path: ['phone'],
      }),
  ),
  asyncHandler(async (req, res) => {
    const request = await students.requestErasure(req.body)
    res.status(201).json({
      ok: true,
      data: { reference: request.reference, kind: request.kind, status: request.status },
      message: 'Logged. We will confirm your identity at the counter, then action it.',
    })
  }),
)

export const studentsRoutes = router
