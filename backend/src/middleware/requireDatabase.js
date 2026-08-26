import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'

/**
 * Fails fast when MongoDB is not connected.
 *
 * Without this, a request that arrives while Atlas is unreachable sits in
 * Mongoose's command buffer until it times out — ten seconds of a held
 * connection to produce a 500 that was knowable immediately. Answering 503
 * straight away lets a client retry or fall back, and keeps a blip from
 * exhausting the connection pool.
 *
 * `readyState` is checked per request rather than latched at boot, so this
 * also covers a connection that drops after the server started.
 */
export const requireDatabase = (_req, _res, next) => {
  if (mongoose.connection.readyState === 1) return next()
  return next(ApiError.unavailable('The database is unreachable — try again shortly'))
}
