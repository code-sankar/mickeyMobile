import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRoutes } from './routes/index.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // Behind a reverse proxy, `req.ip` is only correct once the proxy is
  // trusted — and rate limiting keyed on the proxy's own IP would throttle
  // every visitor as one. A hop count rather than `true` so a spoofed
  // X-Forwarded-For cannot claim to be an extra hop.
  app.set('trust proxy', env.trustProxy)
  app.disable('x-powered-by')

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin, curl and server-to-server requests send no Origin.
        if (!origin) return callback(null, true)
        if (!env.isProd && env.corsOrigins.length === 0) return callback(null, true)
        // `false` withholds the header, which is all a denial is — the browser
        // does the blocking. Passing an Error here instead would turn every
        // stray cross-origin probe into a logged 500, which is noise, not
        // security: the request was already going to fail in the browser.
        return callback(null, env.corsOrigins.includes(origin))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  )

  app.use(compression())
  app.use(express.json({ limit: '100kb' }))
  app.use(express.urlencoded({ extended: true, limit: '100kb' }))

  if (!env.isTest) {
    app.use(morgan(env.isProd ? 'combined' : 'dev'))
  }

  app.use(env.apiPrefix, apiLimiter, apiRoutes)

  // A bare GET / on the API host should say what this is, not 404.
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      data: {
        name: 'Mickey Mobile API',
        version: '1.0.0',
        docs: `${env.apiPrefix}/health`,
      },
    })
  })

  app.use(notFound)
  app.use(errorHandler)

  return app
}
