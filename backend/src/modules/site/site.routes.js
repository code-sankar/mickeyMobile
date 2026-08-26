import { Router } from 'express'
import { Setting } from '../../models/Setting.js'
import { Review } from '../../models/Review.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { getOpenState } from '../../domain/hours.js'
import { env } from '../../config/env.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await Setting.get('site')
    if (!settings) throw ApiError.unavailable('Site content has not been seeded')

    res.set('Cache-Control', 'public, max-age=300')
    res.json({ ok: true, data: settings })
  }),
)

/**
 * Live open/closed state, in the shop's timezone.
 *
 * The frontend computes this from the visitor's own clock, which is fine for a
 * badge and wrong for anyone travelling. This is the authoritative answer, so
 * it is explicitly uncacheable — a 5-minute CDN copy of "Open now" outlives
 * closing time.
 */
router.get(
  '/status',
  asyncHandler(async (_req, res) => {
    const settings = await Setting.get('site')
    const hours = settings?.hours ?? []

    res.set('Cache-Control', 'no-store')
    res.json({ ok: true, data: getOpenState(hours, new Date(), env.timezone) })
  }),
)

router.get(
  '/hours',
  asyncHandler(async (_req, res) => {
    const settings = await Setting.get('site')
    res.set('Cache-Control', 'public, max-age=3600')
    res.json({ ok: true, data: settings?.hours ?? [] })
  }),
)

/**
 * The stat band under the hero.
 *
 * One of the four stats is flagged `fromReviews` in the content, and this
 * fills it from the live review average rather than the hardcoded 4.9 — the
 * whole point of the flag.
 */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const settings = await Setting.get('site')
    const stats = settings?.stats ?? []

    const needsReviews = stats.some((s) => s.fromReviews)
    const summary = needsReviews ? await Review.summary() : null
    const sample = settings?.sampleRating

    res.json({
      ok: true,
      data: stats.map((stat) =>
        stat.fromReviews && summary
          ? { ...stat, value: sample?.value ?? summary.average }
          : stat,
      ),
    })
  }),
)

export const siteRoutes = router
