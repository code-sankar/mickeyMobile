import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const handler = (_req, _res, next) =>
  next(ApiError.tooMany('Too many requests — give it a minute and try again'))

/** Broad ceiling for everything under the API prefix. */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
})

/**
 * Tighter budget for endpoints that create rows.
 *
 * A booking form and a registration form are the two places where a bored
 * script can fill the shop's queue with junk, so they get their own, much
 * smaller allowance than reading the catalogue does.
 */
export const writeLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.writeMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
  skip: () => env.isTest,
})

/** Credential stuffing is a different shape of abuse — count failures only. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
  skip: () => env.isTest,
})
