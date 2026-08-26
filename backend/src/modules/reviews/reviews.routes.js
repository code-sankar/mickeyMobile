import { Router } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as reviews from './reviews.service.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await reviews.getReviews()

    // Google's terms forbid caching review content, so the CDN/browser must
    // not hold it either. The sample set is the shop's own and can be cached.
    if (data.source === 'google') res.set('Cache-Control', 'no-store')
    else res.set('Cache-Control', 'public, max-age=300')

    res.json({ ok: true, data })
  }),
)

export const reviewsRoutes = router
