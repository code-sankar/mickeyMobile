import { StudentRegistration } from '../../models/StudentRegistration.js'
import { ErasureRequest } from '../../models/ErasureRequest.js'
import { Booking } from '../../models/Booking.js'
import { Setting } from '../../models/Setting.js'
import { Counter } from '../../models/Counter.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  ageFrom,
  earliestEligibleDob,
  isAgeEligible,
  latestEligibleDob,
  savingsFor,
} from '../../domain/discount.js'

/** The offer terms, as the students page reads them. */
export async function offerTerms() {
  const students = (await Setting.get('students')) ?? {}
  return {
    ...students,
    // Computed rather than stored, so the date picker's bounds are never stale.
    latestEligibleDob: latestEligibleDob(students.minimumAge ?? 18),
    earliestEligibleDob: earliestEligibleDob(students.maximumAge ?? null),
  }
}

/** What a given repair bill is worth under the offer. */
export async function calculateSavings(amount) {
  const { discountTiers = [], minimumSpend = 0 } = (await Setting.get('students')) ?? {}
  return { amount, minimumSpend, ...savingsFor(amount, discountTiers, minimumSpend) }
}

async function nextRegistrationId() {
  const n = await Counter.next('student-registration', 1)
  return `MM-STU-${String(n).padStart(5, '0')}`
}

/**
 * Registers a student for the discount.
 *
 * Two rules are enforced here rather than trusted from the form:
 *
 * 1. The 18+ gate. The page says "Verified from your date of birth at
 *    registration. Under-18s cannot register" — so it is re-derived from the
 *    DOB server-side, not read from a client-computed age.
 * 2. Verification consent. It is the only consent that gates submission;
 *    marketing is optional by design and bundling them would make neither
 *    freely given. Both are stored with the exact label that was shown.
 *
 * There is no student-ID upload, here or anywhere: the privacy notice promises
 * the card is checked at the counter and never uploaded to the website.
 */
export async function register(input, { ip = null, source = 'web' } = {}) {
  const terms = (await Setting.get('students')) ?? {}
  const minimumAge = terms.minimumAge ?? 18
  const maximumAge = terms.maximumAge ?? null

  if (!isAgeEligible(input.dob, minimumAge, maximumAge)) {
    // Distinct messages: too young and aged out are different problems, and one
    // combined "check your age" leaves someone retyping a date that was right.
    const age = ageFrom(input.dob)
    throw ApiError.unprocessable('Some details need another look', {
      details: {
        dob:
          age !== null && age > minimumAge ? `Offer ends at ${maximumAge}` : `Must be ${minimumAge}+`,
      },
    })
  }

  const existing = await StudentRegistration.findOne({
    phone: input.phone,
    status: { $in: ['pending', 'verified'] },
  })
  if (existing) {
    throw ApiError.conflict('That number is already registered', {
      details: { phone: 'Already registered' },
    })
  }

  const labels = terms.consentPurposes ?? {}

  const registration = await StudentRegistration.create({
    registrationId: await nextRegistrationId(),
    name: input.name,
    dob: input.dob,
    institution: input.institution,
    phone: input.phone,
    email: input.email,
    address: input.address,
    device: {
      brand: input.deviceBrand,
      model: input.deviceModel,
      age: input.deviceAge,
      issue: input.issue ?? '',
    },
    consent: {
      verification: {
        granted: true,
        label: labels.verification?.label ?? 'Verification consent',
        at: new Date(),
      },
      marketing: input.marketing
        ? { granted: true, label: labels.marketing?.label ?? 'Marketing consent', at: new Date() }
        : null,
    },
    status: 'pending',
    source,
    submittedIp: ip,
  })

  return registration
}

/** Unsubscribe, without touching the registration itself. */
export async function withdrawMarketing(phone) {
  const registration = await StudentRegistration.findOneAndUpdate(
    { phone, 'consent.marketing.granted': true, 'consent.marketing.withdrawnAt': null },
    { $set: { 'consent.marketing.withdrawnAt': new Date() } },
    { new: true },
  )
  if (!registration) throw ApiError.notFound('No active marketing consent for that number')
  return registration
}

/**
 * Logs an access, correction or erasure request.
 *
 * The retention policy tells visitors they can ask at any time; this is where
 * the asking lands. Erasure is *not* executed automatically — the shop
 * verifies identity at the counter first, which is the same standard it
 * applies to the discount itself.
 */
export async function requestErasure({ kind, phone = null, email = null, note = '' }) {
  if (!phone && !email) {
    throw ApiError.unprocessable('Tell us how to find your record', {
      details: { phone: 'Phone or email required' },
    })
  }

  const n = await Counter.next('erasure-request', 1)
  const request = await ErasureRequest.create({
    reference: `MM-DSR-${String(n).padStart(5, '0')}`,
    kind,
    phone,
    email,
    note,
    status: 'open',
  })

  return request
}

/** Executes a logged erasure once staff have verified who is asking. */
export async function executeErasure(reference, handledBy) {
  const request = await ErasureRequest.findOne({ reference })
  if (!request) throw ApiError.notFound('No such request')
  if (request.status === 'completed') throw ApiError.conflict('Already completed')

  const match = []
  if (request.phone) match.push({ phone: request.phone })
  if (request.email) match.push({ email: request.email })

  const [registrations, bookings] = await Promise.all([
    StudentRegistration.deleteMany({ $or: match }),
    // Bookings match on phone only — they never carry an email.
    request.phone ? Booking.deleteMany({ phone: request.phone }) : { deletedCount: 0 },
  ])

  request.status = 'completed'
  request.completedAt = new Date()
  request.handledBy = handledBy
  request.outcome = {
    registrationsAffected: registrations.deletedCount ?? 0,
    bookingsAffected: bookings.deletedCount ?? 0,
    note: 'Erased on verified request',
  }
  await request.save()

  return request
}

export async function listRegistrations({ status, q, page = 1, limit = 25 }) {
  const filter = {}
  if (status) filter.status = status
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ registrationId: rx }, { name: rx }, { phone: rx }, { email: rx }, { institution: rx }]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    StudentRegistration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StudentRegistration.countDocuments(filter),
  ])

  const terms = (await Setting.get('students')) ?? {}
  return {
    items: items.map((r) => ({ ...r.toJSON(), age: ageFrom(r.dob) })),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    minimumAge: terms.minimumAge ?? 18,
    maximumAge: terms.maximumAge ?? null,
  }
}

export async function decideRegistration(registrationId, { status, reason = '' }, by) {
  const registration = await StudentRegistration.findOne({ registrationId })
  if (!registration) throw ApiError.notFound('No such registration')

  registration.status = status
  if (status === 'verified') {
    registration.verifiedAt = new Date()
    registration.verifiedBy = by
    registration.rejectionReason = null
    registration.submittedIp = null
  } else if (status === 'rejected') {
    registration.rejectionReason = reason
    registration.verifiedAt = null
  }

  await registration.save()
  return registration
}
