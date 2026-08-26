/**
 * An error with an HTTP status attached.
 *
 * `details` carries the field-keyed validation shape the frontend forms
 * already render (`{ phone: '10-digit mobile' }`), so a 422 from this API
 * drops straight into the existing `errors` state without translation.
 */
export class ApiError extends Error {
  constructor(status, message, { code = null, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(message = 'Bad request', options) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options })
  }

  static unauthorized(message = 'Authentication required', options) {
    return new ApiError(401, message, { code: 'UNAUTHORIZED', ...options })
  }

  static forbidden(message = 'Not allowed', options) {
    return new ApiError(403, message, { code: 'FORBIDDEN', ...options })
  }

  static notFound(message = 'Not found', options) {
    return new ApiError(404, message, { code: 'NOT_FOUND', ...options })
  }

  static conflict(message = 'Conflict', options) {
    return new ApiError(409, message, { code: 'CONFLICT', ...options })
  }

  static unprocessable(message = 'Validation failed', options) {
    return new ApiError(422, message, { code: 'VALIDATION_FAILED', ...options })
  }

  static tooMany(message = 'Too many requests', options) {
    return new ApiError(429, message, { code: 'RATE_LIMITED', ...options })
  }

  static unavailable(message = 'Service unavailable', options) {
    return new ApiError(503, message, { code: 'UNAVAILABLE', ...options })
  }
}
