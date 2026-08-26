import { ApiError } from '../utils/ApiError.js'

/**
 * Zod validation that speaks the frontend's language.
 *
 * The forms in `useStudentRegistration` and `BookingModal` keep errors as
 * `{ field: 'short message' }` and render them inline. Flattening Zod issues
 * into exactly that shape means a 422 from this API can be dropped into the
 * existing `setErrors(...)` call with no mapping layer in between.
 */
function flatten(error) {
  const details = {}
  for (const issue of error.issues) {
    // Nested paths collapse to the leaf the form actually labels:
    // `device.brand` → `deviceBrand` is done by the schemas themselves, so a
    // dotted key here means a genuinely nested payload.
    const key = issue.path.join('.') || '_'
    if (!details[key]) details[key] = issue.message
  }
  return details
}

const pick = (req, source) => {
  if (source === 'query') return req.query
  if (source === 'params') return req.params
  // A POST with no body at all leaves `req.body` undefined, which Zod reports
  // as one "expected object" issue against no field. An empty object instead
  // lets every required field report itself, so the form highlights all of
  // them rather than showing a single unattached message.
  return req.body ?? {}
}

/**
 * Validates one part of the request and replaces it with the parsed result,
 * so handlers read coerced, trimmed, defaulted values rather than raw input.
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(pick(req, source))

  if (!result.success) {
    return next(
      ApiError.unprocessable('Some details need another look', { details: flatten(result.error) }),
    )
  }

  // `req.query` is a getter in Express 5 — assigning to it throws, so parsed
  // query values go somewhere the handler can still reach them.
  if (source === 'query') req.validatedQuery = result.data
  else if (source === 'params') req.validatedParams = result.data
  else req.body = result.data

  return next()
}
