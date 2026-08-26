import { Router } from 'express'
import mongoose from 'mongoose'
import { env, isAdminConfigured, isGoogleConfigured } from '../config/env.js'
import { requireDatabase } from '../middleware/requireDatabase.js'
import { catalogRoutes } from '../modules/catalog/catalog.routes.js'
import { repairsRoutes } from '../modules/repairs/repairs.routes.js'
import { bookingsRoutes } from '../modules/bookings/bookings.routes.js'
import { studentsRoutes } from '../modules/students/students.routes.js'
import { reviewsRoutes } from '../modules/reviews/reviews.routes.js'
import { siteRoutes } from '../modules/site/site.routes.js'
import { adminRoutes } from '../modules/admin/admin.routes.js'

const router = Router()

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

/**
 * Health check for the platform's probe.
 *
 * Reports 503 while the database is down so a rolling deploy does not send
 * traffic to an instance that can only return errors.
 */
router.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState
  const healthy = dbState === 1

  res.status(healthy ? 200 : 503).json({
    ok: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      uptime: Math.round(process.uptime()),
      database: STATES[dbState] ?? 'unknown',
      integrations: {
        googlePlaces: isGoogleConfigured() ? 'configured' : 'sample-fallback',
        admin: isAdminConfigured() ? 'enabled' : 'disabled',
      },
      timezone: env.timezone,
      timestamp: new Date().toISOString(),
    },
  })
})

/**
 * Each group reads or writes MongoDB, so each is guarded.
 *
 * Per-group rather than one blanket `router.use`: a blanket guard runs before
 * route matching, which turns a typo'd URL into "the database is unreachable"
 * — an answer that is both wrong and unactionable. `/health` above stays
 * unguarded on purpose, so a probe can tell a degraded instance from a dead one.
 */
router.use('/catalog', requireDatabase, catalogRoutes)
router.use('/repairs', requireDatabase, repairsRoutes)
router.use('/bookings', requireDatabase, bookingsRoutes)
router.use('/students', requireDatabase, studentsRoutes)
router.use('/reviews', requireDatabase, reviewsRoutes)
router.use('/site', requireDatabase, siteRoutes)

// Without a JWT secret there is no safe way to gate these, so they are not
// mounted at all rather than mounted and hoping.
if (isAdminConfigured()) {
  // No blanket guard here: `requireAdmin` answers an unauthenticated caller
  // with 401 before any database work, and guards the connection itself once
  // the token checks out. Login carries its own guard.
  router.use('/admin', adminRoutes)
} else {
  console.warn('[routes] JWT_SECRET not set — /admin routes are disabled')
}

export const apiRoutes = router
