import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'

/**
 * Serverless entry point (Vercel).
 *
 * `src/server.js` is the long-lived process version and calls `listen()`.
 * A serverless platform does the listening itself and just wants a handler, so
 * this module exports the app instead.
 *
 * Two things have to be different here, and both are about connections:
 *
 *   1. The Mongoose connection is cached on `globalThis`, not module scope.
 *      Warm invocations reuse the module, but a platform may also evaluate the
 *      module more than once per container; caching on the global means every
 *      path finds the same connection. Without this each invocation opens a
 *      new one and an Atlas cluster runs out of connections under mild load.
 *
 *   2. Each request awaits that connection before reaching the router. The
 *      long-lived server connects once at boot and can afford
 *      `bufferCommands: false`; a cold lambda has no boot phase, so without
 *      this await the first request through would hit `requireDatabase` while
 *      the connection is still opening and get a 503 it did not deserve.
 */

const globalForMongo = globalThis
globalForMongo.__mickeyMongo ??= { promise: null }

function connect() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection)

  globalForMongo.__mickeyMongo.promise ??= mongoose
    .connect(env.mongoUri, {
      dbName: env.mongoDbName,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      // One socket per container. Concurrency comes from the platform running
      // more containers, so a large pool per container just multiplies idle
      // sockets against the Atlas limit.
      maxPoolSize: 1,
      minPoolSize: 0,
      retryWrites: true,
    })
    .then((m) => m.connection)
    .catch((error) => {
      // Never cache a rejected promise, or one bad cold start poisons every
      // subsequent request to this container.
      globalForMongo.__mickeyMongo.promise = null
      throw error
    })

  return globalForMongo.__mickeyMongo.promise
}

mongoose.set('strictQuery', true)
mongoose.set('bufferCommands', false)

const app = createApp()

export default async function handler(req, res) {
  try {
    await connect()
  } catch (error) {
    console.error('[api] database connection failed:', error.message)
    // Fall through rather than returning early: `/health` must still answer so
    // a probe can distinguish "database down" from "function dead", and
    // `requireDatabase` turns the rest into a clean 503.
  }
  return app(req, res)
}
