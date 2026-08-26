/**
 * Catalogue rules that are not expressible as a Mongo query.
 *
 * Filtering and sorting happen in the database (see the catalog service);
 * what lives here is the shop's merchandising logic — which categories count
 * as accessories, and what "related" means — ported from `selectors.js`.
 */

/**
 * The shop sells handsets and the gear that goes on them. These three
 * categories are the accessories side, and `/accessories` is built entirely
 * from this list.
 */
export const ACCESSORY_CATEGORIES = ['cases', 'chargers', 'audio']

export const isAccessory = (product) => ACCESSORY_CATEGORIES.includes(product.category)

export const SORTS = ['featured', 'price-asc', 'price-desc']

/** Free-text search covers exactly the fields the frontend searched. */
export const SEARCH_FIELDS = ['name', 'brand', 'subtitle', 'blurb']

/** Mongo sort spec for a sort id. `featured` keeps the curated seed order. */
export function sortSpec(sort) {
  if (sort === 'price-asc') return { price: 1, order: 1 }
  if (sort === 'price-desc') return { price: -1, order: 1 }
  return { order: 1 }
}

/**
 * Same category first, then same brand — never the product itself.
 * Kept in application code because it is two ranked passes, not one query.
 */
export function rankRelated(product, pool, limit = 4) {
  if (!product) return []
  const sameCategory = pool.filter((p) => p.id !== product.id && p.category === product.category)
  const sameBrand = pool.filter(
    (p) => p.id !== product.id && p.brand === product.brand && p.category !== product.category,
  )
  const seen = new Set()
  return [...sameCategory, ...sameBrand]
    .filter((p) => !seen.has(p.id) && seen.add(p.id))
    .slice(0, limit)
}

/** Percentage saved off MRP, rounded — the savings sticker on a card. */
export function discountPct(price, mrp) {
  if (!mrp || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}
