import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`))
}

/**
 * Turns anything thrown anywhere into one JSON envelope.
 *
 * Mongo's own errors are translated rather than passed through: a duplicate
 * key is a 409 the caller can act on, not a 500, and its raw message names
 * internal indexes that no client should see.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export const errorHandler = (error, req, res, _next) => {
  let status = error.status ?? 500
  let message = error.message ?? 'Something went wrong'
  let code = error.code ?? 'INTERNAL_ERROR'
  let details = error.details ?? null

  if (error instanceof mongoose.Error.ValidationError) {
    status = 422
    code = 'VALIDATION_FAILED'
    message = 'Some details need another look'
    details = Object.fromEntries(
      Object.entries(error.errors).map(([field, e]) => [field, e.message]),
    )
  } else if (error instanceof mongoose.Error.CastError) {
    status = 400
    code = 'BAD_IDENTIFIER'
    message = `Not a valid ${error.path}`
    details = null
  } else if (error.code === 11000) {
    status = 409
    code = 'DUPLICATE'
    const field = Object.keys(error.keyPattern ?? {})[0] ?? 'record'
    message = `That ${field} is already registered`
    details = { [field]: 'Already registered' }
  } else if (
    error instanceof mongoose.Error.MongooseServerSelectionError ||
    // A connection that drops *after* `requireDatabase` waved the request
    // through surfaces as a buffering timeout. Still the database being
    // unavailable, so still a 503 the caller can retry — not a 500.
    /buffering timed out|topology (was destroyed|is closed)|pool (is )?cleared/i.test(error.message ?? '')
  ) {
    status = 503
    code = 'DATABASE_UNAVAILABLE'
    message = 'The database is unreachable — try again shortly'
    details = null
  } else if (error.type === 'entity.parse.failed') {
    status = 400
    code = 'MALFORMED_JSON'
    message = 'Request body is not valid JSON'
  }

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error)
  }

  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(env.isProd ? {} : { stack: error.stack }),
    },
  })
}
