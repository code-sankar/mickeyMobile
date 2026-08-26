import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { slug } from '../../validation/common.js'
import { SORTS } from '../../domain/catalog.js'
import * as catalog from './catalog.service.js'

const router = Router()

/**
 * The shop's filter state lives in the URL on the frontend
 * (`useCatalogFilters`), so the query shape here is deliberately identical:
 * `?category=&q=&sort=` maps one-to-one onto the link a visitor can share.
 */
const listQuery = z.object({
  category: z.string().trim().default('all'),
  q: z.string().trim().max(120).default(''),
  sort: z.enum(SORTS).catch('featured'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
})

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: await catalog.categoriesWithCounts() })
  }),
)

router.get(
  '/accessories',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, data: await catalog.accessoryGroups() })
  }),
)

router.get(
  '/products',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, total, pages, hasMore, items } = await catalog.listProducts(
      req.validatedQuery,
    )
    res.json({
      ok: true,
      data: items,
      meta: { page, limit, total, pages, hasMore, filters: req.validatedQuery },
    })
  }),
)

router.get(
  '/products/:productId',
  validate(z.object({ productId: slug }), 'params'),
  asyncHandler(async (req, res) => {
    const product = await catalog.getProduct(req.validatedParams.productId)
    // Matches the router loader's behaviour: an unknown id is a 404, never a
    // half-empty product page.
    if (!product) throw ApiError.notFound('Product not found')

    const related = await catalog.relatedFor(product.toJSON())
    res.json({ ok: true, data: { product: product.toJSON(), related } })
  }),
)

export const catalogRoutes = router
