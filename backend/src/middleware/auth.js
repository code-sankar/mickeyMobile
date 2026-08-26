import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { env, isAdminConfigured } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { AdminUser } from '../models/AdminUser.js'

export function signAdminToken(user) {
  if (!isAdminConfigured()) throw ApiError.unavailable('Admin auth is not configured')
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )
}

/**
 * Bearer-token gate for `/admin`.
 *
 * The user is re-read on every request rather than trusted from the token, so
 * deactivating an account takes effect immediately instead of whenever their
 * JWT happens to expire.
 */
export const requireAdmin = async (req, _res, next) => {
  try {
    if (!isAdminConfigured()) throw ApiError.unavailable('Admin auth is not configured')

    const header = req.get('authorization') ?? ''
    const [scheme, token] = header.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw ApiError.unauthorized('Send a bearer token')
    }

    let payload
    try {
      payload = jwt.verify(token, env.jwtSecret)
    } catch (error) {
      throw ApiError.unauthorized(
        error.name === 'TokenExpiredError' ? 'Session expired — sign in again' : 'Invalid token',
      )
    }

    // Token checks above are pure CPU and answer first on purpose: a caller
    // with no credentials gets 401, not a report on our database's health.
    // Only a caller who has proved who they are learns the database is down.
    if (mongoose.connection.readyState !== 1) {
      throw ApiError.unavailable('The database is unreachable — try again shortly')
    }

    const user = await AdminUser.findById(payload.sub)
    if (!user?.active) throw ApiError.unauthorized('Account is no longer active')

    req.admin = user
    return next()
  } catch (error) {
    return next(error)
  }
}

/** Owner-only actions — deleting customer data, managing staff. */
export const requireOwner = (req, _res, next) => {
  if (req.admin?.role !== 'owner') return next(ApiError.forbidden('Owner access required'))
  return next()
}
