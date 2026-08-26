import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { slug } from '../../validation/common.js'
import { Setting } from '../../models/Setting.js'
import * as repairs from './repairs.service.js'

const router = Router()

/** The estimator's selection — the only thing a client may send about price. */
export const quoteSchema = z.object({
  brandId: slug,
  modelId: slug,
  issueId: slug,
  gradeId: slug.default('oem'),
})

router.get(
  '/options',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: await repairs.estimatorOptions() })
  }),
)

router.get(
  '/brands',
  asyncHandler(async (_req, res) => {
    const brands = await repairs.listBrands()
    res.json({ ok: true, data: brands.map((b) => b.toJSON()) })
  }),
)

router.get(
  '/brands/:brandId',
  validate(z.object({ brandId: slug }), 'params'),
  asyncHandler(async (req, res) => {
    const brand = await repairs.getBrand(req.validatedParams.brandId)
    if (!brand) throw ApiError.notFound('We do not service that brand')
    res.json({ ok: true, data: brand.toJSON() })
  }),
)

router.get(
  '/issues',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: await repairs.issuesWithStartingPrice() })
  }),
)

router.get(
  '/grades',
  asyncHandler(async (_req, res) => {
    const grades = await repairs.listGrades()
    res.json({ ok: true, data: grades.map((g) => g.toJSON()) })
  }),
)

router.get(
  '/process',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: (await Setting.get('process')) ?? [] })
  }),
)

/**
 * POST rather than GET because the selection is a body the estimator already
 * holds, and because a quote is a computed answer rather than a document at a
 * stable URL. It writes nothing.
 */
router.post(
  '/quote',
  validate(quoteSchema),
  asyncHandler(async (req, res) => {
    res.json({ ok: true, data: await repairs.quoteFor(req.body) })
  }),
)

export const repairsRoutes = router
