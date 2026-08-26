import { Brand } from '../../models/Brand.js'
import { Issue } from '../../models/Issue.js'
import { PartGrade } from '../../models/PartGrade.js'
import { Setting } from '../../models/Setting.js'
import { buildQuote, startingPriceFor } from '../../domain/quote.js'
import { ApiError } from '../../utils/ApiError.js'

export const listBrands = () => Brand.find({ active: true }).sort({ order: 1 })

export const getBrand = (brandId) => Brand.findOne({ id: brandId, active: true })

export const listIssues = () => Issue.find({ active: true }).sort({ order: 1 })

export const listGrades = () => PartGrade.find({ active: true }).sort({ order: 1 })

/** Issues with the cheapest advertised rate across the whole catalogue. */
export async function issuesWithStartingPrice() {
  const [issues, brands] = await Promise.all([listIssues(), listBrands()])
  const plain = brands.map((b) => b.toJSON())
  return issues.map((issue) => ({
    ...issue.toJSON(),
    startingPrice: startingPriceFor(plain, issue.id),
  }))
}

/**
 * Everything the estimator needs to boot, in one request.
 *
 * The frontend estimator walks brand → model → issue → estimate, and each step
 * needs the next list. Four round trips to render one widget is worse than one
 * payload of a few kilobytes, so this is the endpoint it should call.
 */
export async function estimatorOptions() {
  const [brands, issues, grades, bookingOptions] = await Promise.all([
    listBrands(),
    issuesWithStartingPrice(),
    listGrades(),
    Setting.get('booking-options'),
  ])

  return {
    brands: brands.map((b) => b.toJSON()),
    issues,
    grades: grades.map((g) => g.toJSON()),
    timeSlots: bookingOptions?.timeSlots ?? [],
    serviceModes: bookingOptions?.serviceModes ?? [],
  }
}

/**
 * Resolve a selection into a priced quote.
 *
 * Every 404 here names the part that did not resolve rather than a generic
 * "not found", because the estimator can then send the visitor back to that
 * exact step instead of resetting the whole flow.
 */
export async function quoteFor({ brandId, modelId, issueId, gradeId }) {
  const [brandDoc, issueDoc, grades] = await Promise.all([
    getBrand(brandId),
    Issue.findOne({ id: issueId, active: true }),
    listGrades(),
  ])

  if (!brandDoc) throw ApiError.notFound('We do not service that brand', { details: { brandId: 'Unknown brand' } })

  const brand = brandDoc.toJSON()
  const model = brand.models.find((m) => m.id === modelId && m.active !== false)
  if (!model) {
    throw ApiError.notFound('We do not have prices for that model', {
      details: { modelId: 'Unknown model' },
    })
  }

  if (!issueDoc) throw ApiError.notFound('We do not offer that repair', { details: { issueId: 'Unknown repair' } })

  // An unknown grade falls back to the first one, exactly as `getGrade` did.
  const grade = grades.find((g) => g.id === gradeId)?.toJSON() ?? grades[0]?.toJSON()
  if (!grade) throw ApiError.unavailable('No part grades are configured')

  const quote = buildQuote({ brand, model, issue: issueDoc.toJSON(), grade })
  if (!quote) {
    throw ApiError.notFound('We do not have a price for that combination yet', {
      details: { issueId: `No ${issueId} price for ${model.name}` },
    })
  }

  return quote
}
