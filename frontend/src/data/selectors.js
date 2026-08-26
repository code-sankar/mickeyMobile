/**
 * The data access layer.
 *
 * Components never reach into the raw arrays in this folder — they call these
 * selectors instead. That keeps the shape of the content an implementation
 * detail of `src/data`, so swapping any of it for a CMS or an API later is a
 * change to this one file rather than to every component that reads it.
 */
import { brands, issues, partsGrades } from './repairs'
import { categories, products } from './products'

/* ------------------------------------------------------------------ repairs */

export const listBrands = () => brands
export const listIssues = () => issues
export const listGrades = () => partsGrades

export const getBrand = (brandId) => brands.find((b) => b.id === brandId) ?? null

export const getModel = (brandId, modelId) =>
  getBrand(brandId)?.models.find((m) => m.id === modelId) ?? null

export const getIssue = (issueId) => issues.find((i) => i.id === issueId) ?? null

export const getGrade = (gradeId) => partsGrades.find((g) => g.id === gradeId) ?? partsGrades[0]

/** Walk-in rate for a model/issue pair at a given part grade, rounded to ₹100. */
export function priceFor(model, issue, grade) {
  if (!model || !issue) return null
  const multiplier = issue.gradable ? grade.multiplier : 1
  return Math.round((model.prices[issue.id] * multiplier) / 100) * 100
}

/**
 * The full quote for a selection. This is the single definition of how a
 * price becomes a customer-facing estimate — the estimator, the booking form
 * and the confirmation all read the same object.
 */
export function buildQuote({ brandId, modelId, issueId, gradeId }) {
  const brand = getBrand(brandId)
  const model = getModel(brandId, modelId)
  const issue = getIssue(issueId)
  if (!brand || !model || !issue) return null

  const grade = getGrade(gradeId)
  const price = priceFor(model, issue, grade)

  return {
    brand,
    model,
    issue,
    grade,
    price,
    low: Math.round((price * 0.93) / 100) * 100,
    turnaround: issue.turnaround,
    warranty: issue.gradable ? `${grade.warrantyDays} days` : issue.warranty,
    gradeLabel: issue.gradable ? grade.name : 'Board-level service',
  }
}

/** Cheapest advertised rate for an issue across the whole catalogue. */
export function startingPriceFor(issueId) {
  const all = brands.flatMap((b) => b.models.map((m) => m.prices[issueId])).filter(Boolean)
  return all.length ? Math.min(...all) : null
}

/* --------------------------------------------------------------------- shop */

export const listCategories = () => categories

export const getCategory = (categoryId) => categories.find((c) => c.id === categoryId) ?? null

export const getProduct = (productId) => products.find((p) => p.id === productId) ?? null

export const isCategory = (categoryId) => categories.some((c) => c.id === categoryId)

/** Product count per category, including the synthetic "all" bucket. */
export function categoryCounts() {
  return Object.fromEntries(
    categories.map((c) => [
      c.id,
      c.id === 'all' ? products.length : products.filter((p) => p.category === c.id).length,
    ]),
  )
}

const SEARCH_FIELDS = ['name', 'brand', 'subtitle', 'blurb']

/** Category + free-text + sort, applied in that order. */
export function filterProducts({ category = 'all', query = '', sort = 'featured' } = {}) {
  const q = query.trim().toLowerCase()

  let list = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (!q) return true
    return SEARCH_FIELDS.some((field) => p[field].toLowerCase().includes(q))
  })

  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)

  return list
}

/* -------------------------------------------------------------- accessories */

/**
 * The shop sells handsets and the gear that goes on them. These three
 * categories are the accessories side, and the `/accessories` route is built
 * entirely from this list — adding a fourth category here is all it takes to
 * surface it on that page.
 */
export const ACCESSORY_CATEGORIES = ['cases', 'chargers', 'audio']

export const isAccessory = (product) => ACCESSORY_CATEGORIES.includes(product.category)

export const listAccessories = () => products.filter(isAccessory)

/**
 * Accessory categories with their products and price floor, in the order
 * declared above — for the merchandised panels on the accessories page.
 */
export function accessoryGroups() {
  return ACCESSORY_CATEGORIES.map((id) => {
    const items = products.filter((p) => p.category === id)
    return {
      id,
      label: getCategory(id)?.label ?? id,
      items,
      count: items.length,
      from: items.length ? Math.min(...items.map((p) => p.price)) : null,
    }
  })
}

/** Same category first, then same brand — never the product itself. */
export function relatedProducts(product, limit = 4) {
  if (!product) return []
  const sameCategory = products.filter((p) => p.id !== product.id && p.category === product.category)
  const sameBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand && p.category !== product.category,
  )
  return [...sameCategory, ...sameBrand].slice(0, limit)
}
