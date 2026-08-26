import { Product } from '../../models/Product.js'
import { Category } from '../../models/Category.js'
import { ACCESSORY_CATEGORIES, rankRelated, sortSpec } from '../../domain/catalog.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Category + free-text + sort, applied in that order — the same pipeline
 * `filterProducts` ran in the browser, now paginated because the collection is
 * no longer a 21-item array that ships with the bundle.
 *
 * Search uses a regex across the four searchable fields rather than the text
 * index, because the frontend matched substrings ("pix" finds "Pixel") and a
 * text index only matches whole terms. At this catalogue size that is the
 * right trade; the text index stays defined for when it is not.
 */
export async function listProducts({ category = 'all', q = '', sort = 'featured', page = 1, limit = 24 }) {
  const filter = { active: true }

  if (category !== 'all') filter.category = category

  const query = q.trim()
  if (query) {
    const rx = new RegExp(escapeRegex(query), 'i')
    filter.$or = [{ name: rx }, { brand: rx }, { subtitle: rx }, { blurb: rx }]
  }

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sortSpec(sort)).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])

  return {
    items: items.map((p) => p.toJSON()),
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
    hasMore: skip + items.length < total,
  }
}

/** Product count per category, including the synthetic `all` bucket. */
export async function categoriesWithCounts() {
  const [categories, grouped, total] = await Promise.all([
    Category.find().sort({ order: 1 }).lean(),
    Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Product.countDocuments({ active: true }),
  ])

  const counts = Object.fromEntries(grouped.map((g) => [g._id, g.count]))

  return categories.map(({ _id, ...c }) => ({
    ...c,
    count: c.id === 'all' ? total : (counts[c.id] ?? 0),
  }))
}

export async function getProduct(productId) {
  return Product.findOne({ id: productId, active: true })
}

/** Same category first, then same brand — ranked in code, not by the database. */
export async function relatedFor(product, limit = 4) {
  if (!product) return []

  const pool = await Product.find({
    active: true,
    id: { $ne: product.id },
    $or: [{ category: product.category }, { brand: product.brand }],
  }).sort({ order: 1 })

  return rankRelated(product, pool.map((p) => p.toJSON()), limit)
}

/**
 * The accessories page: each accessory category with its products, a count and
 * a price floor, in the declared order.
 */
export async function accessoryGroups() {
  const [categories, products] = await Promise.all([
    Category.find({ id: { $in: ACCESSORY_CATEGORIES } }).lean(),
    Product.find({ active: true, category: { $in: ACCESSORY_CATEGORIES } }).sort({ order: 1 }),
  ])

  const labels = Object.fromEntries(categories.map((c) => [c.id, c.label]))

  return ACCESSORY_CATEGORIES.map((id) => {
    const items = products.filter((p) => p.category === id).map((p) => p.toJSON())
    return {
      id,
      label: labels[id] ?? id,
      items,
      count: items.length,
      from: items.length ? Math.min(...items.map((p) => p.price)) : null,
    }
  })
}
