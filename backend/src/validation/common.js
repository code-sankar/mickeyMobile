import { z } from 'zod'

/**
 * Field rules shared by every form-backed endpoint.
 *
 * These mirror `BookingModal.validate` and `useStudentRegistration.validate`
 * exactly, message text included. The client checks are for immediacy; these
 * are the ones that decide, and keeping the wording identical means a request
 * that slips past the browser produces the same sentence under the same field.
 */

/** Indian mobile numbers: ten digits opening 6–9, however the user spaced it. */
export const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => /^[6-9]\d{9}$/.test(v), '10-digit mobile')

/** Deliberately loose: catches a typo, does not reject an unusual address. */
export const email = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Check this')
  .max(200)

export const personName = z.string().trim().min(2, 'Required').max(120)

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Not a date')
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), 'Not a date')

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Not a valid id')

/** `MM-1042`, case-insensitive on the way in. */
export const ticket = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^MM-\d{3,8}$/, 'Not a ticket number')

export const slug = z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i, 'Not a valid id')

/** Page/limit with sane ceilings so a caller cannot ask for the whole table. */
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
})
